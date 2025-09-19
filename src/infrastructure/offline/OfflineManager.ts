import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Photo } from '../../domain/photo/types';
import { STORAGE_KEYS, CACHE_CONFIG } from '../../utils/constants';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'PHOTO';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineState {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  pendingActions: OfflineAction[];
  lastSyncTime: number | null;
  syncInProgress: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private state: OfflineState;
  private listeners: ((state: OfflineState) => void)[] = [];
  private syncQueue: OfflineAction[] = [];
  private cache: Map<string, CacheEntry<any>> = new Map();
  private netInfoUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.state = {
      isOnline: true,
      isConnected: true,
      connectionType: null,
      pendingActions: [],
      lastSyncTime: null,
      syncInProgress: false,
    };
    this.initializeNetworkListener();
    this.loadPersistedState();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Inicialização e configuração
  private async initializeNetworkListener(): Promise<void> {
    try {
      // Estado inicial da rede
      const netInfoState = await NetInfo.fetch();
      this.updateNetworkState(netInfoState);

      // Listener para mudanças na rede
      this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
        this.updateNetworkState(state);
      });
    } catch (error) {
      console.error('Erro ao inicializar listener de rede:', error);
    }
  }

  private updateNetworkState(netInfoState: NetInfoState): void {
    const wasOffline = !this.state.isOnline;
    
    this.state = {
      ...this.state,
      isOnline: netInfoState.isConnected || false,
      isConnected: netInfoState.isInternetReachable || false,
      connectionType: netInfoState.type,
    };

    // Se voltou online, tentar sincronizar
    if (wasOffline && this.state.isOnline) {
      this.syncPendingActions();
    }

    this.notifyListeners();
    this.persistState();
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const [pendingActionsStr, lastSyncTimeStr, cacheStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CACHE),
      ]);

      if (pendingActionsStr) {
        this.state.pendingActions = JSON.parse(pendingActionsStr);
      }

      if (lastSyncTimeStr) {
        this.state.lastSyncTime = parseInt(lastSyncTimeStr, 10);
      }

      if (cacheStr) {
        const cacheData = JSON.parse(cacheStr);
        this.cache = new Map(Object.entries(cacheData));
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('Erro ao carregar estado offline:', error);
    }
  }

  private async persistState(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.OFFLINE_ACTIONS,
          JSON.stringify(this.state.pendingActions)
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.LAST_SYNC_TIME,
          this.state.lastSyncTime?.toString() || ''
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.OFFLINE_CACHE,
          JSON.stringify(Object.fromEntries(this.cache))
        ),
      ]);
    } catch (error) {
      console.error('Erro ao persistir estado offline:', error);
    }
  }

  // Gerenciamento de estado
  public getState(): OfflineState {
    return { ...this.state };
  }

  public subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Gerenciamento de ações offline
  public async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.state.pendingActions.push(offlineAction);
    this.notifyListeners();
    await this.persistState();

    // Se estiver online, tentar sincronizar imediatamente
    if (this.state.isOnline) {
      this.syncPendingActions();
    }
  }

  public async syncPendingActions(): Promise<void> {
    if (this.state.syncInProgress || !this.state.isOnline || this.state.pendingActions.length === 0) {
      return;
    }

    this.state.syncInProgress = true;
    this.notifyListeners();

    try {
      const actionsToSync = [...this.state.pendingActions];
      const successfulActions: string[] = [];

      for (const action of actionsToSync) {
        try {
          await this.executeAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Erro ao sincronizar ação ${action.id}:`, error);
          
          // Incrementar contador de tentativas
          action.retryCount++;
          
          // Remover se excedeu o máximo de tentativas
          if (action.retryCount >= action.maxRetries) {
            successfulActions.push(action.id);
            console.warn(`Ação ${action.id} removida após ${action.maxRetries} tentativas`);
          }
        }
      }

      // Remover ações bem-sucedidas ou que excederam tentativas
      this.state.pendingActions = this.state.pendingActions.filter(
        action => !successfulActions.includes(action.id)
      );

      this.state.lastSyncTime = Date.now();
    } catch (error) {
      console.error('Erro durante sincronização:', error);
    } finally {
      this.state.syncInProgress = false;
      this.notifyListeners();
      await this.persistState();
    }
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    // Esta função seria implementada com as chamadas reais da API
    // Por enquanto, simula a execução
    switch (action.type) {
      case 'CREATE':
        console.log('Executando criação offline:', action.data);
        break;
      case 'UPDATE':
        console.log('Executando atualização offline:', action.data);
        break;
      case 'DELETE':
        console.log('Executando exclusão offline:', action.data);
        break;
    }
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Gerenciamento de cache
  public setCache<T>(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: 1,
    };

    this.cache.set(key, entry);
    this.persistState();
  }

  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.persistState();
      return null;
    }

    return entry.data as T;
  }

  public invalidateCache(pattern?: string): void {
    if (pattern) {
      // Remover entradas que correspondem ao padrão
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Limpar todo o cache
      this.cache.clear();
    }
    this.persistState();
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Utilitários para fotos
  public async cachePhoto(photo: Photo): Promise<void> {
    const cacheKey = `photo-${photo.id}`;
    this.setCache(cacheKey, photo, CACHE_CONFIG.PHOTO_TTL);
  }

  public getCachedPhoto(photoId: string): Photo | null {
    const cacheKey = `photo-${photoId}`;
    return this.getCache<Photo>(cacheKey);
  }

  public async cachePhotoList(photos: Photo[], listKey: string): Promise<void> {
    this.setCache(`photos-${listKey}`, photos, CACHE_CONFIG.PHOTO_LIST_TTL);
    
    // Cache individual das fotos também
    for (const photo of photos) {
      await this.cachePhoto(photo);
    }
  }

  public getCachedPhotoList(listKey: string): Photo[] | null {
    return this.getCache<Photo[]>(`photos-${listKey}`);
  }

  // Operações offline para fotos
  public async createPhotoOffline(photo: Omit<Photo, 'id'>): Promise<Photo> {
    const offlinePhoto: Photo = {
      ...photo,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Cache local
    await this.cachePhoto(offlinePhoto);

    // Adicionar à fila de sincronização
    await this.addOfflineAction({
      type: 'CREATE',
      entity: 'PHOTO',
      data: offlinePhoto,
      maxRetries: 3,
    });

    return offlinePhoto;
  }

  public async updatePhotoOffline(photo: Photo): Promise<void> {
    // Atualizar cache local
    await this.cachePhoto(photo);

    // Adicionar à fila de sincronização
    await this.addOfflineAction({
      type: 'UPDATE',
      entity: 'PHOTO',
      data: photo,
      maxRetries: 3,
    });
  }

  public async deletePhotoOffline(photoId: string): Promise<void> {
    // Remover do cache local
    const cacheKey = `photo-${photoId}`;
    this.cache.delete(cacheKey);

    // Adicionar à fila de sincronização
    await this.addOfflineAction({
      type: 'DELETE',
      entity: 'PHOTO',
      data: { id: photoId },
      maxRetries: 3,
    });
  }

  // Verificações de conectividade
  public isOnline(): boolean {
    return this.state.isOnline;
  }

  public isConnected(): boolean {
    return this.state.isConnected;
  }

  public getConnectionType(): string | null {
    return this.state.connectionType;
  }

  public hasPendingActions(): boolean {
    return this.state.pendingActions.length > 0;
  }

  public getPendingActionsCount(): number {
    return this.state.pendingActions.length;
  }

  // Estatísticas e diagnóstico
  public getStats() {
    return {
      isOnline: this.state.isOnline,
      isConnected: this.state.isConnected,
      connectionType: this.state.connectionType,
      pendingActions: this.state.pendingActions.length,
      lastSyncTime: this.state.lastSyncTime,
      syncInProgress: this.state.syncInProgress,
      cacheSize: this.cache.size,
      cacheEntries: Array.from(this.cache.keys()),
    };
  }

  // Limpeza
  public async clearAllData(): Promise<void> {
    this.cache.clear();
    this.state.pendingActions = [];
    this.state.lastSyncTime = null;
    
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_ACTIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME),
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_CACHE),
    ]);

    this.notifyListeners();
  }

  public destroy(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
    this.listeners = [];
    this.cache.clear();
  }
}