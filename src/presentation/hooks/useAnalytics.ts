import { useEffect, useCallback, useRef } from 'react';
import { AnalyticsService, AnalyticsEvent, PerformanceMetrics, UserSession } from '../../infrastructure/analytics/AnalyticsService';

export interface UseAnalyticsOptions {
  userId?: string;
  enableAutoTracking?: boolean;
  trackScreenViews?: boolean;
  trackUserInteractions?: boolean;
}

export interface AnalyticsHookReturn {
  // Métodos de tracking
  track: (eventName: string, properties?: Record<string, any>, category?: AnalyticsEvent['category'], priority?: AnalyticsEvent['priority']) => Promise<void>;
  trackPhotoAction: (action: string, photoId: string, properties?: Record<string, any>) => Promise<void>;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => Promise<void>;
  trackError: (error: Error, context?: Record<string, any>, severity?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  trackUserFlow: (flowName: string, step: string, properties?: Record<string, any>) => Promise<void>;
  trackFeatureUsage: (feature: string, action: string, properties?: Record<string, any>) => Promise<void>;
  
  // Métodos de sessão
  startSession: (userId?: string) => Promise<void>;
  endSession: () => Promise<void>;
  
  // Métodos de dados
  flush: () => Promise<void>;
  getPerformanceMetrics: () => PerformanceMetrics;
  getCurrentSession: () => UserSession | null;
  
  // Estado
  isInitialized: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): AnalyticsHookReturn => {
  const analyticsService = useRef<AnalyticsService>(AnalyticsService.getInstance());
  const isInitializedRef = useRef<boolean>(false);
  const {
    userId,
    enableAutoTracking = true,
    trackScreenViews = true,
    trackUserInteractions = true,
  } = options;

  // Inicializar analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      if (!isInitializedRef.current) {
        await analyticsService.current.initialize(userId);
        isInitializedRef.current = true;
      }
    };

    initializeAnalytics();

    // Cleanup ao desmontar
    return () => {
      if (isInitializedRef.current) {
        analyticsService.current.endSession();
      }
    };
  }, [userId]);

  // Métodos de tracking
  const track = useCallback(async (
    eventName: string,
    properties: Record<string, any> = {},
    category: AnalyticsEvent['category'] = 'user_action',
    priority: AnalyticsEvent['priority'] = 'medium'
  ) => {
    await analyticsService.current.track(eventName, properties, category, priority);
  }, []);

  const trackPhotoAction = useCallback(async (
    action: string,
    photoId: string,
    properties: Record<string, any> = {}
  ) => {
    await analyticsService.current.trackPhotoAction(action, photoId, properties);
  }, []);

  const trackPerformance = useCallback(async (
    metric: string,
    value: number,
    properties: Record<string, any> = {}
  ) => {
    await analyticsService.current.trackPerformance(metric, value, properties);
  }, []);

  const trackError = useCallback(async (
    error: Error,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    await analyticsService.current.trackError(error, context, severity);
  }, []);

  const trackUserFlow = useCallback(async (
    flowName: string,
    step: string,
    properties: Record<string, any> = {}
  ) => {
    await analyticsService.current.trackUserFlow(flowName, step, properties);
  }, []);

  const trackFeatureUsage = useCallback(async (
    feature: string,
    action: string,
    properties: Record<string, any> = {}
  ) => {
    await analyticsService.current.trackFeatureUsage(feature, action, properties);
  }, []);

  // Métodos de sessão
  const startSession = useCallback(async (sessionUserId?: string) => {
    await analyticsService.current.initialize(sessionUserId || userId);
  }, [userId]);

  const endSession = useCallback(async () => {
    await analyticsService.current.endSession();
  }, []);

  // Métodos de dados
  const flush = useCallback(async () => {
    await analyticsService.current.flush();
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return analyticsService.current.getPerformanceMetrics();
  }, []);

  const getCurrentSession = useCallback(() => {
    return analyticsService.current.getCurrentSession();
  }, []);

  return {
    track,
    trackPhotoAction,
    trackPerformance,
    trackError,
    trackUserFlow,
    trackFeatureUsage,
    startSession,
    endSession,
    flush,
    getPerformanceMetrics,
    getCurrentSession,
    isInitialized: isInitializedRef.current,
  };
};

// Hook específico para tracking de performance de fotos
export const usePhotoAnalytics = () => {
  const analytics = useAnalytics();
  const loadStartTimes = useRef<Map<string, number>>(new Map());

  const trackPhotoLoadStart = useCallback((photoId: string) => {
    loadStartTimes.current.set(photoId, Date.now());
    analytics.trackPhotoAction('load_start', photoId);
  }, [analytics]);

  const trackPhotoLoadEnd = useCallback((photoId: string, success: boolean = true) => {
    const startTime = loadStartTimes.current.get(photoId);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      analytics.trackPerformance('photo_load', loadTime, { photoId, success });
      analytics.trackPhotoAction(success ? 'load_success' : 'load_error', photoId, { loadTime });
      loadStartTimes.current.delete(photoId);
    }
  }, [analytics]);

  const trackPhotoInteraction = useCallback((action: string, photoId: string, properties: Record<string, any> = {}) => {
    analytics.trackPhotoAction(action, photoId, {
      ...properties,
      timestamp: Date.now(),
    });
  }, [analytics]);

  const trackPhotoView = useCallback((photoId: string, viewDuration?: number) => {
    analytics.trackPhotoAction('view', photoId, {
      viewDuration,
      timestamp: Date.now(),
    });
  }, [analytics]);

  return {
    ...analytics,
    trackPhotoLoadStart,
    trackPhotoLoadEnd,
    trackPhotoInteraction,
    trackPhotoView,
  };
};

// Hook para tracking de navegação/fluxo de usuário
export const useNavigationAnalytics = () => {
  const analytics = useAnalytics();
  const screenStartTimes = useRef<Map<string, number>>(new Map());
  const currentScreen = useRef<string>('');

  const trackScreenView = useCallback((screenName: string, properties: Record<string, any> = {}) => {
    // Finalizar tracking da tela anterior
    if (currentScreen.current) {
      const startTime = screenStartTimes.current.get(currentScreen.current);
      if (startTime) {
        const duration = Date.now() - startTime;
        analytics.track('screen_exit', {
          screenName: currentScreen.current,
          duration,
        }, 'user_action', 'low');
      }
    }

    // Iniciar tracking da nova tela
    currentScreen.current = screenName;
    screenStartTimes.current.set(screenName, Date.now());
    
    analytics.track('screen_view', {
      screenName,
      ...properties,
    }, 'user_action', 'medium');
  }, [analytics]);

  const trackNavigation = useCallback((from: string, to: string, method: string = 'unknown') => {
    analytics.trackUserFlow('navigation', 'navigate', {
      from,
      to,
      method,
    });
  }, [analytics]);

  const trackUserAction = useCallback((action: string, target: string, properties: Record<string, any> = {}) => {
    analytics.track('user_interaction', {
      action,
      target,
      screen: currentScreen.current,
      ...properties,
    }, 'user_action', 'medium');
  }, [analytics]);

  return {
    ...analytics,
    trackScreenView,
    trackNavigation,
    trackUserAction,
    currentScreen: currentScreen.current,
  };
};

// Hook para tracking de performance da aplicação
export const usePerformanceAnalytics = () => {
  const analytics = useAnalytics();
  const performanceMarks = useRef<Map<string, number>>(new Map());

  const startPerformanceMark = useCallback((markName: string) => {
    performanceMarks.current.set(markName, Date.now());
  }, []);

  const endPerformanceMark = useCallback((markName: string, properties: Record<string, any> = {}) => {
    const startTime = performanceMarks.current.get(markName);
    if (startTime) {
      const duration = Date.now() - startTime;
      analytics.trackPerformance(markName, duration, properties);
      performanceMarks.current.delete(markName);
      return duration;
    }
    return 0;
  }, [analytics]);

  const trackRenderPerformance = useCallback((componentName: string, renderTime: number) => {
    analytics.trackPerformance('component_render', renderTime, {
      componentName,
    });
  }, [analytics]);

  const trackMemoryUsage = useCallback((usage: number, context: string = 'general') => {
    analytics.trackPerformance('memory_usage', usage, {
      context,
      unit: 'MB',
    });
  }, [analytics]);

  const trackNetworkRequest = useCallback((
    url: string,
    method: string,
    duration: number,
    status: number,
    size: number,
    cached: boolean = false
  ) => {
    analytics.trackPerformance('network_request', duration, {
      url,
      method,
      status,
      size,
      cached,
    });
  }, [analytics]);

  return {
    ...analytics,
    startPerformanceMark,
    endPerformanceMark,
    trackRenderPerformance,
    trackMemoryUsage,
    trackNetworkRequest,
  };
};

// Hook para tracking de erros e crashes
export const useErrorAnalytics = () => {
  const analytics = useAnalytics();

  const trackJSError = useCallback((error: Error, errorInfo?: any) => {
    analytics.trackError(error, {
      errorInfo,
      source: 'javascript',
    }, 'high');
  }, [analytics]);

  const trackNetworkError = useCallback((error: Error, url: string, method: string) => {
    analytics.trackError(error, {
      url,
      method,
      source: 'network',
    }, 'medium');
  }, [analytics]);

  const trackValidationError = useCallback((field: string, value: any, rule: string) => {
    analytics.track('validation_error', {
      field,
      value: typeof value === 'string' ? value.substring(0, 100) : value,
      rule,
    }, 'error', 'low');
  }, [analytics]);

  const trackUserError = useCallback((action: string, context: Record<string, any> = {}) => {
    analytics.track('user_error', {
      action,
      ...context,
    }, 'error', 'medium');
  }, [analytics]);

  return {
    ...analytics,
    trackJSError,
    trackNetworkError,
    trackValidationError,
    trackUserError,
  };
};

// Hook para tracking de features específicas
export const useFeatureAnalytics = (featureName: string) => {
  const analytics = useAnalytics();

  const trackFeatureView = useCallback((properties: Record<string, any> = {}) => {
    analytics.trackFeatureUsage(featureName, 'view', properties);
  }, [analytics, featureName]);

  const trackFeatureInteraction = useCallback((action: string, properties: Record<string, any> = {}) => {
    analytics.trackFeatureUsage(featureName, action, properties);
  }, [analytics, featureName]);

  const trackFeatureSuccess = useCallback((action: string, properties: Record<string, any> = {}) => {
    analytics.trackFeatureUsage(featureName, `${action}_success`, properties);
  }, [analytics, featureName]);

  const trackFeatureError = useCallback((action: string, error: Error, properties: Record<string, any> = {}) => {
    analytics.trackFeatureUsage(featureName, `${action}_error`, {
      error: error.message,
      ...properties,
    });
    analytics.trackError(error, {
      feature: featureName,
      action,
      ...properties,
    });
  }, [analytics, featureName]);

  return {
    ...analytics,
    trackFeatureView,
    trackFeatureInteraction,
    trackFeatureSuccess,
    trackFeatureError,
  };
};