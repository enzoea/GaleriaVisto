import { PHOTO_CONFIG, PATTERNS } from './constants';

// Utilitários de data
export const dateUtils = {
  formatDate: (timestamp: number, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (format === 'relative') {
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays} dias atrás`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
      return `${Math.floor(diffDays / 365)} anos atrás`;
    }

    if (format === 'long') {
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },

  isToday: (timestamp: number): boolean => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  isThisWeek: (timestamp: number): boolean => {
    const date = new Date(timestamp);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return date >= weekStart;
  },

  getTimeAgo: (timestamp: number): string => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  },
};

// Utilitários de arquivo
export const fileUtils = {
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  isValidImageFormat: (filename: string): boolean => {
    const extension = fileUtils.getFileExtension(filename);
    return PHOTO_CONFIG.SUPPORTED_FORMATS.includes(extension as any);
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  generateUniqueFilename: (extension: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `photo_${timestamp}_${random}.${extension}`;
  },

  isFileSizeValid: (sizeInBytes: number): boolean => {
    const maxSizeBytes = PHOTO_CONFIG.MAX_PHOTO_SIZE_MB * 1024 * 1024;
    return sizeInBytes <= maxSizeBytes;
  },
};

// Utilitários de localização
export const locationUtils = {
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  formatCoordinates: (lat: number, lon: number, precision: number = 4): string => {
    return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
  },

  isValidCoordinate: (lat: number, lon: number): boolean => {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  getLocationName: async (lat: number, lon: number): Promise<string | null> => {
    // Implementação de geocoding reverso seria aqui
    // Por enquanto, retorna coordenadas formatadas
    return locationUtils.formatCoordinates(lat, lon);
  },
};

// Utilitários de string
export const stringUtils = {
  truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  },

  isValidEmail: (email: string): boolean => {
    return PATTERNS.EMAIL.test(email);
  },

  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },

  sanitizeFilename: (filename: string): string => {
    return filename.replace(/[^a-z0-9.-]/gi, '_');
  },
};

// Utilitários de array
export const arrayUtils = {
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
};

// Utilitários de performance
export const performanceUtils = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  measureTime: async <T>(
    operation: () => Promise<T>,
    label?: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    if (label && __DEV__) {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  },

  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};

// Utilitários de validação
export const validationUtils = {
  isRequired: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  isNumber: (value: any): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value));
  },

  isPositiveNumber: (value: any): boolean => {
    return validationUtils.isNumber(value) && Number(value) > 0;
  },

  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidCoordinates: (coordinates: string): boolean => {
    return PATTERNS.COORDINATES.test(coordinates);
  },
};

// Utilitários de cor
export const colorUtils = {
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  adjustOpacity: (color: string, opacity: number): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  },

  isDarkColor: (hex: string): boolean => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness < 128;
  },
};

// Utilitários de dispositivo
export const deviceUtils = {
  isTablet: (): boolean => {
    // Implementação específica para React Native seria necessária
    return false;
  },

  getDeviceInfo: () => {
    // Implementação específica para React Native seria necessária
    return {
      platform: 'unknown',
      version: 'unknown',
      model: 'unknown',
    };
  },

  hasNotchOrDynamicIsland: (): boolean => {
    // Implementação específica para React Native seria necessária
    return false;
  },
};