import { PhotoRepository } from '../../domain/photo/repository';
import { Photo } from '../../domain/photo/types';
import { OfflineManager, OfflineAction } from './OfflineManager';

export interface SyncResult {
  success: boolean;
  syncedActions: number;
  failedActions: number;
  errors: Array<{
    actionId: string;
    error: string;
    retryable: boolean;
  }>;
  duration: number;
}

export interface SyncStrategy {
  name: string;
  priority: number;
  canHandle: (action: OfflineAction) => boolean;
  execute: (action: OfflineAction, repository: PhotoRepository) => Promise<void>;
}

export interface ConflictResolution {
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolver?: (clientData: any, serverData: any) => any;
}

export class SyncService {
  private repository: PhotoRepository;
  private offlineManager: OfflineManager;
  private strategies: Map<string, SyncStrategy> = new Map();
  private conflictResolution: ConflictResolution;
  private isRunning: boolean = false;

  constructor(
    repository: PhotoRepository,
    conflictResolution: ConflictResolution = { strategy: 'client_wins' }
  ) {
    this.repository = repository;
    this.offlineManager = OfflineManager.getInstance();
    this.conflictResolution = conflictResolution;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Estratégia para criação de fotos
    this.strategies.set('photo_create', {
      name: 'photo_create',
      priority: 1,
      canHandle: (action) => action.type === 'CREATE' && action.entity === 'PHOTO',
      execute: async (action, repository) => {
        const photo = action.data as Photo;
        
        // Verificar se já existe (pode ter sido criado em outra sessão)
        try {
          const result = await repository.findById(photo.id);
          const existing = result.success ? result.data : null;
          if (existing) {
            // Foto já existe, resolver conflito
            await this.resolveConflict(photo, existing, 'CREATE');
            return;
          }
        } catch (error) {
          // Foto não existe, continuar com criação
        }

        // Criar nova foto
        await repository.savePhoto(photo);
      },
    });

    // Estratégia para atualização de fotos
    this.strategies.set('photo_update', {
      name: 'photo_update',
      priority: 2,
      canHandle: (action) => action.type === 'UPDATE' && action.entity === 'PHOTO',
      execute: async (action, repository) => {
        const photo = action.data as Photo;
        
        try {
          // Verificar se a foto ainda existe no servidor
          const serverPhoto = await repository.getPhotoById(photo.id);
          
          // Verificar conflitos baseados em timestamp
          if (serverPhoto.updatedAt && photo.updatedAt) {
            const serverTime = new Date(serverPhoto.updatedAt).getTime();
            const clientTime = new Date(photo.updatedAt).getTime();
            
            if (serverTime > clientTime) {
              // Servidor tem versão mais recente, resolver conflito
              await this.resolveConflict(photo, serverPhoto, 'UPDATE');
              return;
            }
          }

          // Atualizar foto
          await repository.updatePhoto(photo);
        } catch (error) {
          // Foto pode ter sido deletada no servidor
          if (this.isNotFoundError(error)) {
            console.warn(`Foto ${photo.id} não encontrada no servidor durante atualização`);
            return;
          }
          throw error;
        }
      },
    });

    // Estratégia para exclusão de fotos
    this.strategies.set('photo_delete', {
      name: 'photo_delete',
      priority: 3,
      canHandle: (action) => action.type === 'DELETE' && action.entity === 'PHOTO',
      execute: async (action, repository) => {
        const { id } = action.data;
        
        try {
          await repository.deletePhoto(id);
        } catch (error) {
          // Se a foto já foi deletada, não é um erro
          if (this.isNotFoundError(error)) {
            console.info(`Foto ${id} já foi deletada no servidor`);
            return;
          }
          throw error;
        }
      },
    });
  }

  public async sync(): Promise<SyncResult> {
    if (this.isRunning) {
      throw new Error('Sincronização já está em execução');
    }

    if (!this.offlineManager.isOnline()) {
      throw new Error('Não é possível sincronizar offline');
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    const result: SyncResult = {
      success: false,
      syncedActions: 0,
      failedActions: 0,
      errors: [],
      duration: 0,
    };

    try {
      const state = this.offlineManager.getState();
      const actions = [...state.pendingActions];

      if (actions.length === 0) {
        result.success = true;
        return result;
      }

      // Ordenar ações por prioridade e timestamp
      const sortedActions = this.sortActionsByPriority(actions);

      // Executar ações em lotes para evitar sobrecarga
      const batchSize = 5;
      for (let i = 0; i < sortedActions.length; i += batchSize) {
        const batch = sortedActions.slice(i, i + batchSize);
        await this.processBatch(batch, result);
      }

      result.success = result.failedActions === 0;
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      result.errors.push({
        actionId: 'sync_service',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        retryable: true,
      });
    } finally {
      result.duration = Date.now() - startTime;
      this.isRunning = false;
    }

    return result;
  }

  private sortActionsByPriority(actions: OfflineAction[]): OfflineAction[] {
    return actions.sort((a, b) => {
      // Primeiro por prioridade da estratégia
      const strategyA = this.findStrategy(a);
      const strategyB = this.findStrategy(b);
      
      if (strategyA && strategyB) {
        const priorityDiff = strategyA.priority - strategyB.priority;
        if (priorityDiff !== 0) return priorityDiff;
      }

      // Depois por timestamp (mais antigo primeiro)
      return a.timestamp - b.timestamp;
    });
  }

  private async processBatch(actions: OfflineAction[], result: SyncResult): Promise<void> {
    const promises = actions.map(async (action) => {
      try {
        await this.processAction(action);
        result.syncedActions++;
      } catch (error) {
        result.failedActions++;
        result.errors.push({
          actionId: action.id,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          retryable: this.isRetryableError(error),
        });
      }
    });

    await Promise.allSettled(promises);
  }

  private async processAction(action: OfflineAction): Promise<void> {
    const strategy = this.findStrategy(action);
    
    if (!strategy) {
      throw new Error(`Nenhuma estratégia encontrada para ação ${action.type}:${action.entity}`);
    }

    await strategy.execute(action, this.repository);
  }

  private findStrategy(action: OfflineAction): SyncStrategy | undefined {
    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(action)) {
        return strategy;
      }
    }
    return undefined;
  }

  private async resolveConflict(
    clientData: any,
    serverData: any,
    operation: 'CREATE' | 'UPDATE'
  ): Promise<void> {
    switch (this.conflictResolution.strategy) {
      case 'client_wins':
        // Cliente sempre ganha - forçar atualização
        if (operation === 'UPDATE') {
          await this.repository.updatePhoto(clientData);
        }
        break;

      case 'server_wins':
        // Servidor sempre ganha - atualizar cache local
        this.offlineManager.setCache(`photo-${serverData.id}`, serverData);
        break;

      case 'merge':
        // Tentar fazer merge dos dados
        const merged = this.mergeData(clientData, serverData);
        await this.repository.updatePhoto(merged);
        this.offlineManager.setCache(`photo-${merged.id}`, merged);
        break;

      case 'manual':
        // Resolução manual - salvar ambas as versões para o usuário decidir
        if (this.conflictResolution.resolver) {
          const resolved = this.conflictResolution.resolver(clientData, serverData);
          await this.repository.updatePhoto(resolved);
          this.offlineManager.setCache(`photo-${resolved.id}`, resolved);
        } else {
          throw new Error('Conflito requer resolução manual, mas nenhum resolver foi fornecido');
        }
        break;
    }
  }

  private mergeData(clientData: Photo, serverData: Photo): Photo {
    // Estratégia simples de merge - usar dados mais recentes para cada campo
    const merged: Photo = { ...serverData };

    // Comparar timestamps para decidir qual versão usar
    const clientTime = clientData.updatedAt ? new Date(clientData.updatedAt).getTime() : 0;
    const serverTime = serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;

    // Se cliente é mais recente, usar alguns campos do cliente
    if (clientTime > serverTime) {
      merged.title = clientData.title;
      merged.description = clientData.description;
      merged.tags = clientData.tags;
      merged.updatedAt = clientData.updatedAt;
    }

    // Sempre manter metadados do servidor (como URLs, IDs, etc.)
    merged.id = serverData.id;
    merged.uri = serverData.uri;
    merged.createdAt = serverData.createdAt;

    return merged;
  }

  private isNotFoundError(error: any): boolean {
    return error?.status === 404 || 
           error?.code === 'NOT_FOUND' ||
           error?.message?.includes('not found');
  }

  private isRetryableError(error: any): boolean {
    // Erros de rede são geralmente retryable
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
      return true;
    }

    // Erros 5xx do servidor são retryable
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }

    // Erros 4xx geralmente não são retryable (exceto alguns casos)
    if (error?.status >= 400 && error?.status < 500) {
      // 408 (Request Timeout), 429 (Too Many Requests) são retryable
      return error.status === 408 || error.status === 429;
    }

    return false;
  }

  // Métodos públicos para gerenciamento
  public addStrategy(strategy: SyncStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  public removeStrategy(name: string): void {
    this.strategies.delete(name);
  }

  public setConflictResolution(resolution: ConflictResolution): void {
    this.conflictResolution = resolution;
  }

  public isRunning(): boolean {
    return this.isRunning;
  }

  public getStrategies(): SyncStrategy[] {
    return Array.from(this.strategies.values());
  }

  // Sincronização incremental baseada em timestamp
  public async incrementalSync(lastSyncTime?: number): Promise<SyncResult> {
    const result = await this.sync();

    if (result.success && lastSyncTime) {
      // Buscar mudanças do servidor desde o último sync
      try {
        const serverChanges = await this.repository.getPhotosModifiedSince(lastSyncTime);
        
        // Atualizar cache local com mudanças do servidor
        for (const photo of serverChanges) {
          this.offlineManager.setCache(`photo-${photo.id}`, photo);
        }

        // Invalidar listas que podem ter sido afetadas
        this.offlineManager.invalidateCache('photos-');
      } catch (error) {
        console.warn('Erro ao buscar mudanças incrementais do servidor:', error);
      }
    }

    return result;
  }

  // Sincronização forçada (ignora conflitos)
  public async forceSync(): Promise<SyncResult> {
    const originalResolution = this.conflictResolution;
    this.conflictResolution = { strategy: 'client_wins' };
    
    try {
      return await this.sync();
    } finally {
      this.conflictResolution = originalResolution;
    }
  }
}