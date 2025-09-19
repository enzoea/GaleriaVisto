import { useState, useEffect, useCallback, useRef } from 'react';
import { OfflineManager, OfflineState, OfflineAction } from '../../infrastructure/offline/OfflineManager';
import { Photo } from '../../domain/entities/Photo';
import { useErrorHandler } from './useErrorHandler';

export interface UseOfflineOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableNotifications?: boolean;
  maxRetries?: number;
}

export interface OfflineOperations {
  createPhoto: (photo: Omit<Photo, 'id'>) => Promise<Photo>;
  updatePhoto: (photo: Photo) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  syncNow: () => Promise<void>;
  clearPendingActions: () => Promise<void>;
  getCachedPhoto: (photoId: string) => Photo | null;
  getCachedPhotoList: (listKey: string) => Photo[] | null;
  cachePhotoList: (photos: Photo[], listKey: string) => Promise<void>;
}

export const useOffline = (options: UseOfflineOptions = {}) => {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 segundos
    enableNotifications = true,
    maxRetries = 3,
  } = options;

  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: true,
    isConnected: true,
    connectionType: null,
    pendingActions: [],
    lastSyncTime: null,
    syncInProgress: false,
  });

  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
  }[]>([]);

  const offlineManagerRef = useRef<OfflineManager>();
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const { reportError } = useErrorHandler();

  // Inicializar OfflineManager
  useEffect(() => {
    offlineManagerRef.current = OfflineManager.getInstance();
    
    // Subscrever mudanças de estado
    const unsubscribe = offlineManagerRef.current.subscribe((state) => {
      setOfflineState(state);
      
      if (enableNotifications) {
        handleStateChange(state);
      }
    });

    // Estado inicial
    setOfflineState(offlineManagerRef.current.getState());

    return () => {
      unsubscribe();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enableNotifications]);

  // Auto-sync periódico
  useEffect(() => {
    if (autoSync && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (offlineManagerRef.current?.isOnline()) {
          offlineManagerRef.current.syncPendingActions().catch((error) => {
            reportError(error, { context: 'auto-sync' });
          });
        }
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [autoSync, syncInterval, reportError]);

  // Gerenciar notificações baseadas em mudanças de estado
  const handleStateChange = useCallback((state: OfflineState) => {
    const now = Date.now();

    // Notificação quando fica offline
    if (!state.isOnline) {
      addNotification({
        id: `offline-${now}`,
        type: 'warning',
        message: 'Você está offline. As alterações serão sincronizadas quando a conexão for restaurada.',
        timestamp: now,
      });
    }

    // Notificação quando volta online
    if (state.isOnline && offlineState.isOnline === false) {
      addNotification({
        id: `online-${now}`,
        type: 'success',
        message: 'Conexão restaurada. Sincronizando alterações...',
        timestamp: now,
      });
    }

    // Notificação de ações pendentes
    if (state.pendingActions.length > 0 && state.pendingActions.length !== offlineState.pendingActions.length) {
      addNotification({
        id: `pending-${now}`,
        type: 'info',
        message: `${state.pendingActions.length} alteração(ões) aguardando sincronização.`,
        timestamp: now,
      });
    }

    // Notificação de sincronização concluída
    if (state.pendingActions.length === 0 && offlineState.pendingActions.length > 0 && !state.syncInProgress) {
      addNotification({
        id: `synced-${now}`,
        type: 'success',
        message: 'Todas as alterações foram sincronizadas com sucesso.',
        timestamp: now,
      });
    }
  }, [offlineState]);

  const addNotification = useCallback((notification: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: number;
  }) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notification.id);
      return [...filtered, notification].slice(-5); // Manter apenas as 5 mais recentes
    });

    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Operações offline
  const operations: OfflineOperations = {
    createPhoto: useCallback(async (photo: Omit<Photo, 'id'>) => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        const createdPhoto = await offlineManagerRef.current.createPhotoOffline(photo);
        
        if (enableNotifications) {
          addNotification({
            id: `create-${Date.now()}`,
            type: 'info',
            message: `Foto "${photo.title}" adicionada. ${offlineState.isOnline ? 'Sincronizando...' : 'Será sincronizada quando voltar online.'}`,
            timestamp: Date.now(),
          });
        }

        return createdPhoto;
      } catch (error) {
        reportError(error as Error, { context: 'createPhoto', photo });
        throw error;
      }
    }, [offlineState.isOnline, enableNotifications, addNotification, reportError]),

    updatePhoto: useCallback(async (photo: Photo) => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        await offlineManagerRef.current.updatePhotoOffline(photo);
        
        if (enableNotifications) {
          addNotification({
            id: `update-${Date.now()}`,
            type: 'info',
            message: `Foto "${photo.title}" atualizada. ${offlineState.isOnline ? 'Sincronizando...' : 'Será sincronizada quando voltar online.'}`,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        reportError(error as Error, { context: 'updatePhoto', photo });
        throw error;
      }
    }, [offlineState.isOnline, enableNotifications, addNotification, reportError]),

    deletePhoto: useCallback(async (photoId: string) => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        await offlineManagerRef.current.deletePhotoOffline(photoId);
        
        if (enableNotifications) {
          addNotification({
            id: `delete-${Date.now()}`,
            type: 'info',
            message: `Foto removida. ${offlineState.isOnline ? 'Sincronizando...' : 'Será sincronizada quando voltar online.'}`,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        reportError(error as Error, { context: 'deletePhoto', photoId });
        throw error;
      }
    }, [offlineState.isOnline, enableNotifications, addNotification, reportError]),

    syncNow: useCallback(async () => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        if (!offlineState.isOnline) {
          throw new Error('Não é possível sincronizar offline');
        }

        await offlineManagerRef.current.syncPendingActions();
        
        if (enableNotifications) {
          addNotification({
            id: `manual-sync-${Date.now()}`,
            type: 'success',
            message: 'Sincronização manual concluída.',
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        reportError(error as Error, { context: 'syncNow' });
        
        if (enableNotifications) {
          addNotification({
            id: `sync-error-${Date.now()}`,
            type: 'error',
            message: 'Erro durante a sincronização. Tente novamente.',
            timestamp: Date.now(),
          });
        }
        
        throw error;
      }
    }, [offlineState.isOnline, enableNotifications, addNotification, reportError]),

    clearPendingActions: useCallback(async () => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        // Limpar ações pendentes (cuidado: pode causar perda de dados)
        const currentState = offlineManagerRef.current.getState();
        currentState.pendingActions = [];
        
        if (enableNotifications) {
          addNotification({
            id: `clear-pending-${Date.now()}`,
            type: 'warning',
            message: 'Ações pendentes foram removidas.',
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        reportError(error as Error, { context: 'clearPendingActions' });
        throw error;
      }
    }, [enableNotifications, addNotification, reportError]),

    getCachedPhoto: useCallback((photoId: string) => {
      return offlineManagerRef.current?.getCachedPhoto(photoId) || null;
    }, []),

    getCachedPhotoList: useCallback((listKey: string) => {
      return offlineManagerRef.current?.getCachedPhotoList(listKey) || null;
    }, []),

    cachePhotoList: useCallback(async (photos: Photo[], listKey: string) => {
      try {
        if (!offlineManagerRef.current) {
          throw new Error('OfflineManager não inicializado');
        }

        await offlineManagerRef.current.cachePhotoList(photos, listKey);
      } catch (error) {
        reportError(error as Error, { context: 'cachePhotoList', listKey, count: photos.length });
        throw error;
      }
    }, [reportError]),
  };

  // Utilitários
  const getStats = useCallback(() => {
    return offlineManagerRef.current?.getStats() || null;
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Verificações de estado
  const isOnline = offlineState.isOnline;
  const isConnected = offlineState.isConnected;
  const hasPendingActions = offlineState.pendingActions.length > 0;
  const isSyncing = offlineState.syncInProgress;
  const connectionType = offlineState.connectionType;
  const lastSyncTime = offlineState.lastSyncTime;
  const pendingActionsCount = offlineState.pendingActions.length;

  // Status de conectividade
  const connectionStatus = {
    isOnline,
    isConnected,
    connectionType,
    quality: isConnected ? (connectionType === 'wifi' ? 'high' : 'medium') : 'none',
  };

  return {
    // Estado
    isOnline,
    isConnected,
    connectionType,
    connectionStatus,
    hasPendingActions,
    isSyncing,
    lastSyncTime,
    pendingActionsCount,
    notifications,

    // Operações
    ...operations,

    // Utilitários
    getStats,
    clearNotification,
    clearAllNotifications,

    // Estado completo (para debug)
    offlineState,
  };
};

// Hook especializado para fotos offline
export const useOfflinePhotos = (options: UseOfflineOptions = {}) => {
  const offline = useOffline(options);
  
  // Cache inteligente para listas de fotos
  const getCachedPhotosWithFallback = useCallback((
    listKey: string,
    fallbackPhotos: Photo[] = []
  ): Photo[] => {
    const cached = offline.getCachedPhotoList(listKey);
    return cached || fallbackPhotos;
  }, [offline.getCachedPhotoList]);

  // Operação de busca com cache
  const searchPhotosOffline = useCallback((
    query: string,
    allPhotos: Photo[]
  ): Photo[] => {
    const cacheKey = `search-${query.toLowerCase()}`;
    const cached = offline.getCachedPhotoList(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Buscar e cachear resultado
    const results = allPhotos.filter(photo =>
      photo.title.toLowerCase().includes(query.toLowerCase()) ||
      photo.description?.toLowerCase().includes(query.toLowerCase()) ||
      photo.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    offline.cachePhotoList(results, cacheKey);
    return results;
  }, [offline.getCachedPhotoList, offline.cachePhotoList]);

  return {
    ...offline,
    getCachedPhotosWithFallback,
    searchPhotosOffline,
  };
};