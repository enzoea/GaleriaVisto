import { dateUtils, fileUtils, locationUtils, stringUtils } from './helpers';

// Formatadores de data
export const dateFormatters = {
  // Formato padrão brasileiro
  toBrazilianDate: (timestamp: number): string => {
    return dateUtils.formatDate(timestamp, 'short');
  },

  // Formato longo com hora
  toFullDateTime: (timestamp: number): string => {
    return dateUtils.formatDate(timestamp, 'long');
  },

  // Formato relativo (há 2 horas, ontem, etc.)
  toRelativeTime: (timestamp: number): string => {
    return dateUtils.formatDate(timestamp, 'relative');
  },

  // Formato compacto para listas
  toCompactTime: (timestamp: number): string => {
    return dateUtils.getTimeAgo(timestamp);
  },

  // Formato para agrupamento
  toGroupKey: (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return 'Esta semana';
    if (diffDays < 30) return 'Este mês';
    if (diffDays < 365) return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return date.getFullYear().toString();
  },

  // Formato ISO para APIs
  toISOString: (timestamp: number): string => {
    return new Date(timestamp).toISOString();
  },
};

// Formatadores de arquivo
export const fileFormatters = {
  // Tamanho de arquivo legível
  toReadableSize: (bytes: number): string => {
    return fileUtils.formatFileSize(bytes);
  },

  // Nome de arquivo sanitizado
  toSafeFilename: (filename: string): string => {
    return stringUtils.sanitizeFilename(filename);
  },

  // Extensão em maiúscula
  toUpperExtension: (filename: string): string => {
    const ext = fileUtils.getFileExtension(filename);
    return ext.toUpperCase();
  },

  // Tipo de mídia baseado na extensão
  toMediaType: (filename: string): 'image' | 'video' | 'unknown' => {
    const ext = fileUtils.getFileExtension(filename);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    return 'unknown';
  },
};

// Formatadores de localização
export const locationFormatters = {
  // Coordenadas formatadas
  toCoordinateString: (lat: number, lon: number, precision: number = 4): string => {
    return locationUtils.formatCoordinates(lat, lon, precision);
  },

  // Coordenadas em graus, minutos, segundos
  toDMS: (lat: number, lon: number): string => {
    const formatDMS = (coord: number, isLatitude: boolean): string => {
      const absolute = Math.abs(coord);
      const degrees = Math.floor(absolute);
      const minutes = Math.floor((absolute - degrees) * 60);
      const seconds = Math.round(((absolute - degrees) * 60 - minutes) * 60);
      
      const direction = isLatitude 
        ? (coord >= 0 ? 'N' : 'S')
        : (coord >= 0 ? 'E' : 'W');
      
      return `${degrees}°${minutes}'${seconds}"${direction}`;
    };

    return `${formatDMS(lat, true)}, ${formatDMS(lon, false)}`;
  },

  // Distância formatada
  toReadableDistance: (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  },

  // Endereço simplificado (placeholder)
  toSimpleAddress: (lat: number, lon: number): string => {
    // Em uma implementação real, isso faria geocoding reverso
    return locationFormatters.toCoordinateString(lat, lon, 2);
  },
};

// Formatadores de texto
export const textFormatters = {
  // Título capitalizado
  toTitle: (text: string): string => {
    return text
      .split(' ')
      .map(word => stringUtils.capitalize(word))
      .join(' ');
  },

  // Texto truncado
  toTruncated: (text: string, maxLength: number = 50): string => {
    return stringUtils.truncate(text, maxLength);
  },

  // Slug para URLs
  toSlug: (text: string): string => {
    return stringUtils.slugify(text);
  },

  // Texto para busca (normalizado)
  toSearchable: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim();
  },

  // Primeira letra maiúscula
  toSentenceCase: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Remover caracteres especiais
  toAlphanumeric: (text: string): string => {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  },
};

// Formatadores de número
export const numberFormatters = {
  // Número com separadores de milhares
  toLocaleString: (num: number): string => {
    return num.toLocaleString('pt-BR');
  },

  // Porcentagem
  toPercentage: (value: number, total: number, decimals: number = 1): string => {
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
  },

  // Moeda brasileira
  toCurrency: (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  },

  // Número compacto (1K, 1M, etc.)
  toCompactNumber: (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  },

  // Duração em segundos para formato legível
  toDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },
};

// Formatadores de cor
export const colorFormatters = {
  // Hex para RGB
  toRGB: (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  },

  // Hex para RGBA
  toRGBA: (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Cor para nome (aproximado)
  toColorName: (hex: string): string => {
    // Implementação simplificada - em produção usaria uma biblioteca
    const colors: Record<string, string> = {
      '#FF0000': 'Vermelho',
      '#00FF00': 'Verde',
      '#0000FF': 'Azul',
      '#FFFF00': 'Amarelo',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Ciano',
      '#000000': 'Preto',
      '#FFFFFF': 'Branco',
      '#808080': 'Cinza',
    };
    
    return colors[hex.toUpperCase()] || hex;
  },
};

// Formatadores para URLs e links
export const urlFormatters = {
  // URL para domínio
  toDomain: (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  },

  // URL para título legível
  toReadableTitle: (url: string): string => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/\/$/, '');
      const segments = path.split('/').filter(Boolean);
      
      if (segments.length === 0) {
        return urlObj.hostname;
      }
      
      return segments[segments.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]*$/, '') // Remove extensão
        .split(' ')
        .map(word => stringUtils.capitalize(word))
        .join(' ');
    } catch {
      return url;
    }
  },

  // Adicionar protocolo se necessário
  toFullURL: (url: string): string => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  },
};

// Formatadores para dados de foto
export const photoFormatters = {
  // Metadados para exibição
  toMetadataString: (metadata: any): string => {
    const parts: string[] = [];
    
    if (metadata.width && metadata.height) {
      parts.push(`${metadata.width}×${metadata.height}`);
    }
    
    if (metadata.fileSize) {
      parts.push(fileFormatters.toReadableSize(metadata.fileSize));
    }
    
    if (metadata.format) {
      parts.push(metadata.format.toUpperCase());
    }
    
    return parts.join(' • ');
  },

  // Título da foto com fallback
  toDisplayTitle: (photo: { title?: string; uri: string; createdAt: number }): string => {
    if (photo.title) return photo.title;
    
    // Extrair nome do arquivo da URI
    const filename = photo.uri.split('/').pop() || '';
    if (filename && filename !== 'unknown') {
      return filename.replace(/\.[^.]*$/, ''); // Remove extensão
    }
    
    // Fallback para data
    return `Foto de ${dateFormatters.toBrazilianDate(photo.createdAt)}`;
  },

  // Descrição da localização
  toLocationDescription: (location?: { latitude: number; longitude: number }): string => {
    if (!location) return 'Localização não disponível';
    return locationFormatters.toCoordinateString(location.latitude, location.longitude);
  },
};

// Formatador principal que combina todos
export const formatters = {
  date: dateFormatters,
  file: fileFormatters,
  location: locationFormatters,
  text: textFormatters,
  number: numberFormatters,
  color: colorFormatters,
  url: urlFormatters,
  photo: photoFormatters,
};