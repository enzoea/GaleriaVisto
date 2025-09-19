import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo } from '../../domain/photo/types';

export interface CacheConfig {
  maxSize: number; // Tamanho máximo em MB
  maxAge: number; // Idade máxima em milissegundos
  compressionLevel: number; // 0-9, onde 9 é máxima compressão
  enablePrefetch: boolean;
  prefetchDistance: number; // Quantas fotos à frente prefetch
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number; // Tamanho em bytes
  priority: number; // 0-10, onde 10 é máxima prioridade
  compressed?: boolean;
  metadata?: {
    source: string;
    version: string;
    tags: string[];
  };
}

export interface CacheStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  compressionRatio: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheStrategy {
  name: string;
  shouldCache: (key: string, data: any) => boolean;
  getPriority: (key: string, data: any) => number;
  shouldEvict: (entry: CacheEntry, stats: CacheStats) => boolean;
}

export class SmartCache {
  private static instance: SmartCache;
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private strategies: CacheStrategy[] = [];
  private stats: CacheStats;
  private accessHistory: Map<string, number[]> = new Map();
  private prefetchQueue: Set<string> = new Set();

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100, // 100MB por padrão
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      compressionLevel: 5,
      enablePrefetch: true,
      prefetchDistance: 10,
      ...config,
    };

    this.stats = {
      totalSize: 0,
      totalEntries: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 1,
      oldestEntry: Date.now(),
      newestEntry: Date.now(),
    };

    this.initializeStrategies();
    this.loadFromPersistentStorage();
  }

  public static getInstance(config?: Partial<CacheConfig>): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache(config);
    }
    return SmartCache.instance;
  }

  private initializeStrategies(): void {
    // Estratégia LRU (Least Recently Used)
    this.strategies.push({
      name: 'LRU',
      shouldCache: () => true,
      getPriority: (key, data) => {
        const history = this.accessHistory.get(key) || [];
        return Math.min(history.length, 10); // Máximo 10 pontos por frequência
      },
      shouldEvict: (entry, stats) => {
        const age = Date.now() - entry.lastAccess;
        const maxAge = this.config.maxAge;
        return age > maxAge || entry.accessCount < 2;
      },
    });

    // Estratégia por tamanho de arquivo
    this.strategies.push({
      name: 'SIZE_BASED',
      shouldCache: (key, data) => {
        if (key.includes('thumbnail')) return true; // Sempre cache thumbnails
        if (key.includes('full-size')) {
          const size = this.estimateSize(data);
          return size < 5 * 1024 * 1024; // Cache apenas fotos < 5MB
        }
        return true;
      },
      getPriority: (key, data) => {
        if (key.includes('thumbnail')) return 8;
        if (key.includes('preview')) return 6;
        if (key.includes('full-size')) return 4;
        return 5;
      },
      shouldEvict: (entry) => {
        return entry.size > 10 * 1024 * 1024; // Evict arquivos > 10MB
      },
    });

    // Estratégia por frequência de acesso
    this.strategies.push({
      name: 'FREQUENCY_BASED',
      shouldCache: () => true,
      getPriority: (key, data) => {
        const history = this.accessHistory.get(key) || [];
        const recentAccesses = history.filter(time => Date.now() - time < 60 * 60 * 1000);
        return Math.min(recentAccesses.length, 10);
      },
      shouldEvict: (entry) => {
        return entry.accessCount < 3 && Date.now() - entry.timestamp > 60 * 60 * 1000;
      },
    });
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateStats('miss');
      return null;
    }

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateStats('miss');
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.lastAccess = Date.now();
    entry.accessCount++;
    this.updateAccessHistory(key);
    this.updateStats('hit');

    // Descomprimir se necessário
    let data = entry.data;
    if (entry.compressed) {
      data = await this.decompress(data);
    }

    // Prefetch relacionados se habilitado
    if (this.config.enablePrefetch) {
      this.schedulePrefetch(key);
    }

    return data as T;
  }

  public async set<T>(key: string, data: T, options: Partial<CacheEntry> = {}): Promise<void> {
    // Verificar se deve fazer cache baseado nas estratégias
    const shouldCache = this.strategies.every(strategy => strategy.shouldCache(key, data));
    if (!shouldCache) {
      return;
    }

    // Calcular prioridade baseada nas estratégias
    const priority = this.calculatePriority(key, data);
    
    // Estimar tamanho
    const size = this.estimateSize(data);
    
    // Verificar se precisa comprimir
    let finalData = data;
    let compressed = false;
    if (size > 1024 * 1024 && this.config.compressionLevel > 0) { // > 1MB
      finalData = await this.compress(data);
      compressed = true;
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size: compressed ? this.estimateSize(finalData) : size,
      priority,
      compressed,
      ...options,
    };

    // Verificar se precisa fazer eviction
    await this.ensureSpace(entry.size);

    // Adicionar ao cache
    this.cache.set(key, entry);
    this.updateAccessHistory(key);
    this.updateCacheStats();

    // Persistir mudanças críticas
    if (priority >= 8) {
      await this.persistEntry(key, entry);
    }
  }

  public async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessHistory.delete(key);
      this.updateCacheStats();
      await this.removePersistentEntry(key);
    }
    return deleted;
  }

  public async clear(): Promise<void> {
    this.cache.clear();
    this.accessHistory.clear();
    this.prefetchQueue.clear();
    this.updateCacheStats();
    await AsyncStorage.removeItem('@smart_cache');
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  public keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key);
      return entry && !this.isExpired(entry);
    });
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  // Métodos específicos para fotos
  public async cachePhoto(photo: Photo, quality: 'thumbnail' | 'preview' | 'full'): Promise<void> {
    const key = `photo-${quality}-${photo.id}`;
    const priority = quality === 'thumbnail' ? 9 : quality === 'preview' ? 7 : 5;
    
    await this.set(key, photo, {
      priority,
      metadata: {
        source: 'photo_repository',
        version: '1.0',
        tags: ['photo', quality, ...(photo.tags || [])],
      },
    });
  }

  public async getPhoto(photoId: string, quality: 'thumbnail' | 'preview' | 'full'): Promise<Photo | null> {
    const key = `photo-${quality}-${photoId}`;
    return await this.get<Photo>(key);
  }

  public async prefetchPhotos(photoIds: string[], quality: 'thumbnail' | 'preview' = 'preview'): Promise<void> {
    const prefetchPromises = photoIds.map(async (id) => {
      const key = `photo-${quality}-${id}`;
      if (!this.has(key) && !this.prefetchQueue.has(key)) {
        this.prefetchQueue.add(key);
        // Simular carregamento da foto (seria substituído por chamada real)
        // await this.loadPhotoFromSource(id, quality);
      }
    });

    await Promise.allSettled(prefetchPromises);
  }

  public async invalidatePhotos(photoIds?: string[]): Promise<void> {
    if (!photoIds) {
      // Invalidar todas as fotos
      const photoKeys = this.keys().filter(key => key.startsWith('photo-'));
      await Promise.all(photoKeys.map(key => this.delete(key)));
    } else {
      // Invalidar fotos específicas
      const keysToDelete = photoIds.flatMap(id => [
        `photo-thumbnail-${id}`,
        `photo-preview-${id}`,
        `photo-full-${id}`,
      ]);
      await Promise.all(keysToDelete.map(key => this.delete(key)));
    }
  }

  // Métodos privados
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  private calculatePriority(key: string, data: any): number {
    return this.strategies.reduce((maxPriority, strategy) => {
      const priority = strategy.getPriority(key, data);
      return Math.max(maxPriority, priority);
    }, 0);
  }

  private async ensureSpace(requiredSize: number): Promise<void> {
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    
    while (this.stats.totalSize + requiredSize > maxSizeBytes) {
      const evicted = await this.evictLeastValuable();
      if (!evicted) {
        break; // Não conseguiu evict mais nada
      }
    }
  }

  private async evictLeastValuable(): Promise<boolean> {
    let leastValuableKey: string | null = null;
    let leastValuableScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Calcular score baseado em prioridade, frequência e idade
      const ageScore = (Date.now() - entry.lastAccess) / this.config.maxAge;
      const frequencyScore = 1 / Math.max(entry.accessCount, 1);
      const priorityScore = (10 - entry.priority) / 10;
      
      const totalScore = ageScore + frequencyScore + priorityScore;
      
      if (totalScore < leastValuableScore) {
        leastValuableScore = totalScore;
        leastValuableKey = key;
      }
    }

    if (leastValuableKey) {
      await this.delete(leastValuableKey);
      this.stats.evictionCount++;
      return true;
    }

    return false;
  }

  private updateAccessHistory(key: string): void {
    const history = this.accessHistory.get(key) || [];
    history.push(Date.now());
    
    // Manter apenas os últimos 100 acessos
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.accessHistory.set(key, history);
  }

  private updateStats(type: 'hit' | 'miss'): void {
    if (type === 'hit') {
      this.stats.hitRate = (this.stats.hitRate + 1) / 2; // Média móvel simples
    } else {
      this.stats.missRate = (this.stats.missRate + 1) / 2;
    }
  }

  private updateCacheStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
    
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);
    this.stats.oldestEntry = Math.min(...timestamps);
    this.stats.newestEntry = Math.max(...timestamps);
  }

  private estimateSize(data: any): number {
    // Estimativa simples do tamanho em bytes
    return JSON.stringify(data).length * 2; // UTF-16 = 2 bytes por char
  }

  private async compress(data: any): Promise<any> {
    // Implementação simplificada - em produção usaria biblioteca de compressão
    const jsonString = JSON.stringify(data);
    // Simular compressão removendo espaços e otimizando
    return jsonString.replace(/\s+/g, ' ').trim();
  }

  private async decompress(data: any): Promise<any> {
    // Implementação simplificada - em produção usaria biblioteca de descompressão
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  }

  private async schedulePrefetch(key: string): Promise<void> {
    // Implementar lógica de prefetch baseada no padrão de acesso
    if (key.includes('photo-')) {
      const parts = key.split('-');
      if (parts.length >= 3) {
        const quality = parts[1];
        const photoId = parts[2];
        
        // Prefetch fotos relacionadas (próximas na sequência)
        const relatedIds = this.generateRelatedPhotoIds(photoId);
        await this.prefetchPhotos(relatedIds, quality as 'thumbnail' | 'preview');
      }
    }
  }

  private generateRelatedPhotoIds(photoId: string): string[] {
    // Lógica simplificada - em produção seria baseada em metadados reais
    const baseId = parseInt(photoId) || 0;
    return Array.from({ length: this.config.prefetchDistance }, (_, i) => 
      (baseId + i + 1).toString()
    );
  }

  private async loadFromPersistentStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@smart_cache');
      if (stored) {
        const data = JSON.parse(stored);
        // Restaurar apenas entradas críticas (alta prioridade)
        for (const [key, entry] of Object.entries(data)) {
          if ((entry as CacheEntry).priority >= 8) {
            this.cache.set(key, entry as CacheEntry);
          }
        }
        this.updateCacheStats();
      }
    } catch (error) {
      console.warn('Erro ao carregar cache persistente:', error);
    }
  }

  private async persistEntry(key: string, entry: CacheEntry): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@smart_cache') || '{}';
      const data = JSON.parse(stored);
      data[key] = entry;
      await AsyncStorage.setItem('@smart_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao persistir entrada do cache:', error);
    }
  }

  private async removePersistentEntry(key: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@smart_cache') || '{}';
      const data = JSON.parse(stored);
      delete data[key];
      await AsyncStorage.setItem('@smart_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao remover entrada persistente:', error);
    }
  }

  // Métodos de configuração
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public addStrategy(strategy: CacheStrategy): void {
    this.strategies.push(strategy);
  }

  public removeStrategy(name: string): void {
    this.strategies = this.strategies.filter(s => s.name !== name);
  }

  // Métodos de debug e monitoramento
  public getDetailedStats(): any {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: entry.size,
      priority: entry.priority,
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp,
      lastAccess: Date.now() - entry.lastAccess,
    }));

    return {
      ...this.stats,
      entries,
      strategies: this.strategies.map(s => s.name),
      config: this.config,
    };
  }
}