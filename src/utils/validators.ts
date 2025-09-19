import { PHOTO_CONFIG, PATTERNS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule<T = any> {
  validate: (value: T) => ValidationResult;
  message?: string;
}

// Validadores básicos
export const validators = {
  required: (message: string = 'Campo obrigatório'): ValidationRule => ({
    validate: (value: any) => ({
      isValid: value !== null && value !== undefined && value !== '',
      error: value === null || value === undefined || value === '' ? message : undefined,
    }),
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      const isValid = value && value.length >= min;
      return {
        isValid,
        error: !isValid ? (message || `Mínimo de ${min} caracteres`) : undefined,
      };
    },
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => {
      const isValid = !value || value.length <= max;
      return {
        isValid,
        error: !isValid ? (message || `Máximo de ${max} caracteres`) : undefined,
      };
    },
  }),

  email: (message: string = 'Email inválido'): ValidationRule<string> => ({
    validate: (value: string) => {
      const isValid = !value || PATTERNS.EMAIL.test(value);
      return {
        isValid,
        error: !isValid ? message : undefined,
      };
    },
  }),

  phone: (message: string = 'Telefone inválido'): ValidationRule<string> => ({
    validate: (value: string) => {
      const isValid = !value || PATTERNS.PHONE.test(value);
      return {
        isValid,
        error: !isValid ? message : undefined,
      };
    },
  }),

  number: (message: string = 'Deve ser um número'): ValidationRule => ({
    validate: (value: any) => {
      const isValid = !isNaN(Number(value)) && isFinite(Number(value));
      return {
        isValid,
        error: !isValid ? message : undefined,
      };
    },
  }),

  positiveNumber: (message: string = 'Deve ser um número positivo'): ValidationRule => ({
    validate: (value: any) => {
      const num = Number(value);
      const isValid = !isNaN(num) && isFinite(num) && num > 0;
      return {
        isValid,
        error: !isValid ? message : undefined,
      };
    },
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => {
      const isValid = value >= min && value <= max;
      return {
        isValid,
        error: !isValid ? (message || `Valor deve estar entre ${min} e ${max}`) : undefined,
      };
    },
  }),

  url: (message: string = 'URL inválida'): ValidationRule<string> => ({
    validate: (value: string) => {
      if (!value) return { isValid: true };
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return { isValid: false, error: message };
      }
    },
  }),

  coordinates: (message: string = 'Coordenadas inválidas'): ValidationRule<string> => ({
    validate: (value: string) => {
      const isValid = !value || PATTERNS.COORDINATES.test(value);
      return {
        isValid,
        error: !isValid ? message : undefined,
      };
    },
  }),

  custom: <T>(
    validatorFn: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate: (value: T) => ({
      isValid: validatorFn(value),
      error: !validatorFn(value) ? message : undefined,
    }),
  }),
};

// Validadores específicos para fotos
export const photoValidators = {
  title: [
    validators.maxLength(100, 'Título muito longo'),
  ],

  fileSize: (message?: string): ValidationRule<number> => ({
    validate: (sizeInBytes: number) => {
      const maxSizeBytes = PHOTO_CONFIG.MAX_PHOTO_SIZE_MB * 1024 * 1024;
      const isValid = sizeInBytes <= maxSizeBytes;
      return {
        isValid,
        error: !isValid ? (message || `Arquivo muito grande. Máximo: ${PHOTO_CONFIG.MAX_PHOTO_SIZE_MB}MB`) : undefined,
      };
    },
  }),

  imageFormat: (message?: string): ValidationRule<string> => ({
    validate: (filename: string) => {
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      const isValid = PHOTO_CONFIG.SUPPORTED_FORMATS.includes(extension as any);
      return {
        isValid,
        error: !isValid ? (message || `Formato não suportado. Use: ${PHOTO_CONFIG.SUPPORTED_FORMATS.join(', ')}`) : undefined,
      };
    },
  }),

  coordinates: [
    validators.custom(
      (coords: { latitude: number; longitude: number }) => {
        if (!coords) return true;
        return coords.latitude >= -90 && coords.latitude <= 90 &&
               coords.longitude >= -180 && coords.longitude <= 180;
      },
      'Coordenadas inválidas'
    ),
  ],
};

// Validadores para formulários
export const formValidators = {
  searchText: [
    validators.maxLength(100, 'Texto de busca muito longo'),
  ],

  dateRange: [
    validators.custom(
      (range: { start?: number; end?: number }) => {
        if (!range || (!range.start && !range.end)) return true;
        if (range.start && range.end) {
          return range.start <= range.end;
        }
        return true;
      },
      'Data inicial deve ser anterior à data final'
    ),
  ],

  locationRadius: [
    validators.positiveNumber('Raio deve ser um número positivo'),
    validators.range(1, 10000, 'Raio deve estar entre 1m e 10km'),
  ],
};

// Função para validar um valor contra múltiplas regras
export const validateValue = <T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  for (const rule of rules) {
    const result = rule.validate(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

// Função para validar um objeto completo
export const validateObject = <T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, ValidationRule<any>[]>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    const result = validateValue(value, rules as ValidationRule<any>[]);
    
    if (!result.isValid) {
      errors[key as keyof T] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Hook para validação em tempo real
export const useValidation = <T extends Record<string, any>>(
  schema: Record<keyof T, ValidationRule<any>[]>
) => {
  const validate = (obj: T) => validateObject(obj, schema);
  
  const validateField = (key: keyof T, value: any) => {
    const rules = schema[key];
    if (!rules) return { isValid: true };
    return validateValue(value, rules);
  };

  return { validate, validateField };
};

// Validadores para configurações
export const settingsValidators = {
  theme: [
    validators.custom(
      (theme: string) => ['light', 'dark', 'auto'].includes(theme),
      'Tema inválido'
    ),
  ],

  language: [
    validators.custom(
      (lang: string) => ['pt', 'en', 'es'].includes(lang),
      'Idioma não suportado'
    ),
  ],

  cacheSize: [
    validators.positiveNumber('Tamanho do cache deve ser positivo'),
    validators.range(10, 1000, 'Tamanho do cache deve estar entre 10MB e 1GB'),
  ],

  autoBackup: [
    validators.custom(
      (enabled: boolean) => typeof enabled === 'boolean',
      'Valor deve ser verdadeiro ou falso'
    ),
  ],

  backupInterval: [
    validators.positiveNumber('Intervalo deve ser positivo'),
    validators.range(1, 168, 'Intervalo deve estar entre 1 e 168 horas'),
  ],
};