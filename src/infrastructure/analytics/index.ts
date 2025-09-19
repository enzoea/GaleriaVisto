// Analytics Service
export { AnalyticsService } from './AnalyticsService';
export type {
  AnalyticsEvent,
  UserSession,
  DeviceInfo,
  PerformanceMetrics,
  NetworkMetric,
  CrashReport,
  AnalyticsConfig,
} from './AnalyticsService';

// Re-export hooks
export {
  useAnalytics,
  usePhotoAnalytics,
  useNavigationAnalytics,
  usePerformanceAnalytics,
  useErrorAnalytics,
  useFeatureAnalytics,
} from '../../presentation/hooks/useAnalytics';

export type { UseAnalyticsOptions, AnalyticsHookReturn } from '../../presentation/hooks/useAnalytics';