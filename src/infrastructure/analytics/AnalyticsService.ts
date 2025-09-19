import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  category: 'user_action' | 'performance' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: AnalyticsEvent[];
  deviceInfo: DeviceInfo;
  appVersion: string;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model?: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
  hasNotch: boolean;
}

export interface PerformanceMetrics {
  appStartTime: number;
  firstRenderTime: number;
  photoLoadTimes: number[];
  cacheHitRate: number;
  memoryUsage: number;
  networkRequests: NetworkMetric[];
  crashes: CrashReport[];
}

export interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  size: number;
  timestamp: number;
  cached: boolean;
}

export interface CrashReport {
  error: string;
  stack: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number; // em milissegundos
  maxStorageSize: number; // em MB
  enablePerformanceTracking: boolean;
  enableCrashReporting: boolean;
  enableUserTracking: boolean;
  samplingRate: number; // 0-1, onde 1 = 100% dos eventos
  endpoints: {
    events: string;
    performance: string;
    crashes: string;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private currentSession: UserSession | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics;
  private flushTimer: number | null = null;
  private isInitialized: boolean = false;

  private constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 50,
      flushInterval: 30000, // 30 segundos
      maxStorageSize: 10, // 10MB
      enablePerformanceTracking: true,
      enableCrashReporting: true,
      enableUserTracking: true,
      samplingRate: 1.0,
      endpoints: {
        events: '/api/analytics/events',
        performance: '/api/analytics/performance',
        crashes: '/api/analytics/crashes',
      },
      ...config,
    };

    this.performanceMetrics = {
      appStartTime: Date.now(),
      firstRenderTime: 0,
      photoLoadTimes: [],
      cacheHitRate: 0,
      memoryUsage: 0,
      networkRequests: [],
      crashes: [],
    };
  }

  public static getInstance(config?: Partial<AnalyticsConfig>): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService(config);
    }
    return AnalyticsService.instance;
  }

  public async initialize(userId?: string): Promise<void> {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      // Carregar dados persistidos
      await this.loadPersistedData();

      // Iniciar nova sessão
      await this.startSession(userId);

      // Configurar flush automático
      this.setupAutoFlush();

      // Configurar listeners de performance
      if (this.config.enablePerformanceTracking) {
        this.setupPerformanceTracking();
      }

      // Configurar crash reporting
      if (this.config.enableCrashReporting) {
        this.setupCrashReporting();
      }

      this.isInitialized = true;
      
      // Evento de inicialização
      this.track('app_initialized', {
        platform: Platform.OS,
        version: Platform.Version,
        config: this.config,
      }, 'system', 'medium');

    } catch (error) {
      console.error('Erro ao inicializar Analytics:', error);
    }
  }

  public async track(
    eventName: string,
    properties: Record<string, any> = {},
    category: AnalyticsEvent['category'] = 'user_action',
    priority: AnalyticsEvent['priority'] = 'medium'
  ): Promise<void> {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        platform: Platform.OS,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: this.currentSession?.deviceInfo ? undefined : properties.userId,
      category,
      priority,
    };

    // Adicionar à fila
    this.eventQueue.push(event);

    // Adicionar à sessão atual
    if (this.currentSession) {
      this.currentSession.events.push(event);
    }

    // Flush imediato para eventos críticos
    if (priority === 'critical') {
      await this.flush();
    } else if (this.eventQueue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  public async trackPhotoAction(action: string, photoId: string, properties: Record<string, any> = {}): Promise<void> {
    await this.track(`photo_${action}`, {
      photoId,
      ...properties,
    }, 'user_action', 'medium');
  }

  public async trackPerformance(metric: string, value: number, properties: Record<string, any> = {}): Promise<void> {
    if (!this.config.enablePerformanceTracking) return;

    await this.track(`performance_${metric}`, {
      value,
      unit: properties.unit || 'ms',
      ...properties,
    }, 'performance', 'low');

    // Atualizar métricas internas
    this.updatePerformanceMetrics(metric, value, properties);
  }

  public async trackError(error: Error, context: Record<string, any> = {}, severity: CrashReport['severity'] = 'medium'): Promise<void> {
    if (!this.config.enableCrashReporting) return;

    const crashReport: CrashReport = {
      error: error.message,
      stack: error.stack || '',
      timestamp: Date.now(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: context.userId,
      context,
      severity,
    };

    this.performanceMetrics.crashes.push(crashReport);

    await this.track('error_occurred', {
      error: error.message,
      stack: error.stack,
      context,
      severity,
    }, 'error', severity === 'critical' ? 'critical' : 'high');
  }

  public async trackNetworkRequest(metric: NetworkMetric): Promise<void> {
    if (!this.config.enablePerformanceTracking) return;

    this.performanceMetrics.networkRequests.push(metric);

    await this.track('network_request', {
      url: metric.url,
      method: metric.method,
      duration: metric.duration,
      status: metric.status,
      size: metric.size,
      cached: metric.cached,
    }, 'performance', 'low');
  }

  public async trackUserFlow(flowName: string, step: string, properties: Record<string, any> = {}): Promise<void> {
    await this.track(`flow_${flowName}_${step}`, {
      flowName,
      step,
      ...properties,
    }, 'user_action', 'medium');
  }

  public async trackFeatureUsage(feature: string, action: string, properties: Record<string, any> = {}): Promise<void> {
    await this.track(`feature_${feature}_${action}`, {
      feature,
      action,
      ...properties,
    }, 'user_action', 'medium');
  }

  // Métodos de sessão
  private async startSession(userId?: string): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
      deviceInfo,
      appVersion: '1.0.0', // Seria obtido do package.json
    };

    if (userId && this.config.enableUserTracking) {
      await this.track('session_started', {
        userId,
        deviceInfo,
      }, 'system', 'medium');
    }
  }

  public async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    await this.track('session_ended', {
      duration: this.currentSession.duration,
      eventCount: this.currentSession.events.length,
    }, 'system', 'medium');

    // Flush final
    await this.flush();

    // Persistir sessão
    await this.persistSession(this.currentSession);

    this.currentSession = null;
  }

  // Métodos de flush e persistência
  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Agrupar eventos por prioridade
      const groupedEvents = this.groupEventsByPriority(events);

      // Enviar eventos críticos primeiro
      for (const [priority, eventGroup] of Object.entries(groupedEvents)) {
        if (eventGroup.length > 0) {
          await this.sendEvents(eventGroup, priority as AnalyticsEvent['priority']);
        }
      }

      // Limpar storage se necessário
      await this.cleanupStorage();

    } catch (error) {
      console.error('Erro ao fazer flush dos eventos:', error);
      // Recolocar eventos na fila em caso de erro
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private async sendEvents(events: AnalyticsEvent[], priority: AnalyticsEvent['priority']): Promise<void> {
    // Simular envio para servidor
    console.log(`Enviando ${events.length} eventos de prioridade ${priority}`);
    
    // Em produção, faria requisição HTTP real
    // await fetch(this.config.endpoints.events, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events, priority }),
    // });

    // Persistir localmente como backup
    await this.persistEvents(events);
  }

  // Métodos de configuração e performance
  private setupAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(async () => {
      await this.flush();
    }, this.config.flushInterval);
  }

  private setupPerformanceTracking(): void {
    // Monitorar tempo de primeira renderização
    setTimeout(() => {
      this.performanceMetrics.firstRenderTime = Date.now() - this.performanceMetrics.appStartTime;
      this.trackPerformance('first_render', this.performanceMetrics.firstRenderTime);
    }, 100);

    // Monitorar uso de memória (simulado)
    setInterval(() => {
      // Em produção, usaria APIs nativas para obter uso real de memória
      this.performanceMetrics.memoryUsage = Math.random() * 100;
      this.trackPerformance('memory_usage', this.performanceMetrics.memoryUsage, { unit: 'MB' });
    }, 60000); // A cada minuto
  }

  private setupCrashReporting(): void {
    // Configurar handler global de erros
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.trackError(error, { isFatal }, isFatal ? 'critical' : 'high');
      
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Capturar promise rejections
    const originalRejectionHandler = require('react-native/Libraries/Core/ExceptionsManager').handleException;
    require('react-native/Libraries/Core/ExceptionsManager').handleException = (error: any, isFatal: boolean) => {
      this.trackError(error, { isFatal, source: 'promise_rejection' }, isFatal ? 'critical' : 'high');
      originalRejectionHandler(error, isFatal);
    };
  }

  // Métodos utilitários
  private shouldSample(): boolean {
    return Math.random() <= this.config.samplingRate;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    // Em produção, usaria bibliotecas como react-native-device-info
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      model: 'Unknown',
      screenWidth: 375, // Seria obtido de Dimensions
      screenHeight: 812,
      isTablet: false,
      hasNotch: false,
    };
  }

  private groupEventsByPriority(events: AnalyticsEvent[]): Record<string, AnalyticsEvent[]> {
    return events.reduce((groups, event) => {
      const priority = event.priority;
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(event);
      return groups;
    }, {} as Record<string, AnalyticsEvent[]>);
  }

  private updatePerformanceMetrics(metric: string, value: number, properties: Record<string, any>): void {
    switch (metric) {
      case 'photo_load':
        this.performanceMetrics.photoLoadTimes.push(value);
        // Manter apenas os últimos 100 tempos
        if (this.performanceMetrics.photoLoadTimes.length > 100) {
          this.performanceMetrics.photoLoadTimes.shift();
        }
        break;
      
      case 'cache_hit_rate':
        this.performanceMetrics.cacheHitRate = value;
        break;
    }
  }

  // Métodos de persistência
  private async persistEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const key = `@analytics_events_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('Erro ao persistir eventos:', error);
    }
  }

  private async persistSession(session: UserSession): Promise<void> {
    try {
      const key = `@analytics_session_${session.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao persistir sessão:', error);
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analyticsKeys = keys.filter(key => key.startsWith('@analytics_'));
      
      // Carregar eventos não enviados
      const eventKeys = analyticsKeys.filter(key => key.includes('events'));
      for (const key of eventKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const events = JSON.parse(data) as AnalyticsEvent[];
          this.eventQueue.push(...events);
          await AsyncStorage.removeItem(key); // Remover após carregar
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados persistidos:', error);
    }
  }

  private async cleanupStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analyticsKeys = keys.filter(key => key.startsWith('@analytics_'));
      
      // Calcular tamanho total
      let totalSize = 0;
      const keysSizes: Array<{ key: string; size: number; timestamp: number }> = [];
      
      for (const key of analyticsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const size = data.length;
          totalSize += size;
          
          // Extrair timestamp do nome da chave
          const timestampMatch = key.match(/_(\d+)$/);
          const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0;
          
          keysSizes.push({ key, size, timestamp });
        }
      }

      // Se exceder o limite, remover os mais antigos
      const maxSizeBytes = this.config.maxStorageSize * 1024 * 1024;
      if (totalSize > maxSizeBytes) {
        keysSizes.sort((a, b) => a.timestamp - b.timestamp); // Mais antigos primeiro
        
        let removedSize = 0;
        for (const { key, size } of keysSizes) {
          await AsyncStorage.removeItem(key);
          removedSize += size;
          
          if (totalSize - removedSize <= maxSizeBytes) {
            break;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
    }
  }

  // Métodos públicos para configuração
  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.flushTimer) {
      this.setupAutoFlush();
    }
  }

  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public getCurrentSession(): UserSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  // Métodos para relatórios
  public async generateReport(startDate: Date, endDate: Date): Promise<any> {
    // Gerar relatório de analytics para o período especificado
    const sessions = await this.getSessionsInPeriod(startDate, endDate);
    
    return {
      period: { startDate, endDate },
      totalSessions: sessions.length,
      totalEvents: sessions.reduce((total, session) => total + session.events.length, 0),
      averageSessionDuration: sessions.reduce((total, session) => total + (session.duration || 0), 0) / sessions.length,
      topEvents: this.getTopEvents(sessions),
      performanceMetrics: this.performanceMetrics,
      crashReport: this.generateCrashReport(sessions),
    };
  }

  private async getSessionsInPeriod(startDate: Date, endDate: Date): Promise<UserSession[]> {
    // Implementação simplificada - em produção buscaria do storage
    return this.currentSession ? [this.currentSession] : [];
  }

  private getTopEvents(sessions: UserSession[]): Array<{ name: string; count: number }> {
    const eventCounts: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.events.forEach(event => {
        eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
      });
    });

    return Object.entries(eventCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private generateCrashReport(sessions: UserSession[]): any {
    const crashes = this.performanceMetrics.crashes;
    
    return {
      totalCrashes: crashes.length,
      crashesBySeverity: crashes.reduce((acc, crash) => {
        acc[crash.severity] = (acc[crash.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topCrashes: crashes
        .reduce((acc, crash) => {
          const key = crash.error;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
    };
  }

  // Cleanup
  public async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    await this.endSession();
    await this.flush();
    
    this.isInitialized = false;
  }
}