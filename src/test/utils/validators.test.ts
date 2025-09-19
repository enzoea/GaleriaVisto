import {
  basicValidators,
  photoValidators,
  formValidators,
  settingsValidators,
  validateValue,
  validateObject,
  useValidation,
} from '../../utils/validators';
import { renderHook, act } from '@testing-library/react-native';

describe('basicValidators', () => {
  describe('required', () => {
    it('deve retornar erro para valores vazios', () => {
      expect(basicValidators.required('')).toEqual({
        isValid: false,
        error: 'Este campo é obrigatório',
      });
      expect(basicValidators.required(null)).toEqual({
        isValid: false,
        error: 'Este campo é obrigatório',
      });
      expect(basicValidators.required(undefined)).toEqual({
        isValid: false,
        error: 'Este campo é obrigatório',
      });
    });

    it('deve retornar válido para valores preenchidos', () => {
      expect(basicValidators.required('texto')).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.required(0)).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.required(false)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('minLength', () => {
    it('deve retornar erro para strings muito curtas', () => {
      const validator = basicValidators.minLength(5);
      expect(validator('abc')).toEqual({
        isValid: false,
        error: 'Deve ter pelo menos 5 caracteres',
      });
    });

    it('deve retornar válido para strings com tamanho adequado', () => {
      const validator = basicValidators.minLength(3);
      expect(validator('abc')).toEqual({
        isValid: true,
        error: null,
      });
      expect(validator('abcdef')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('maxLength', () => {
    it('deve retornar erro para strings muito longas', () => {
      const validator = basicValidators.maxLength(5);
      expect(validator('abcdefgh')).toEqual({
        isValid: false,
        error: 'Deve ter no máximo 5 caracteres',
      });
    });

    it('deve retornar válido para strings com tamanho adequado', () => {
      const validator = basicValidators.maxLength(5);
      expect(validator('abc')).toEqual({
        isValid: true,
        error: null,
      });
      expect(validator('abcde')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('email', () => {
    it('deve retornar erro para emails inválidos', () => {
      expect(basicValidators.email('invalid-email')).toEqual({
        isValid: false,
        error: 'Email inválido',
      });
      expect(basicValidators.email('test@')).toEqual({
        isValid: false,
        error: 'Email inválido',
      });
      expect(basicValidators.email('@domain.com')).toEqual({
        isValid: false,
        error: 'Email inválido',
      });
    });

    it('deve retornar válido para emails corretos', () => {
      expect(basicValidators.email('test@example.com')).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.email('user.name@domain.co.uk')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('url', () => {
    it('deve retornar erro para URLs inválidas', () => {
      expect(basicValidators.url('not-a-url')).toEqual({
        isValid: false,
        error: 'URL inválida',
      });
      expect(basicValidators.url('ftp://invalid')).toEqual({
        isValid: false,
        error: 'URL inválida',
      });
    });

    it('deve retornar válido para URLs corretas', () => {
      expect(basicValidators.url('https://example.com')).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.url('http://test.org/path')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('number', () => {
    it('deve retornar erro para não-números', () => {
      expect(basicValidators.number('abc')).toEqual({
        isValid: false,
        error: 'Deve ser um número válido',
      });
      expect(basicValidators.number('12abc')).toEqual({
        isValid: false,
        error: 'Deve ser um número válido',
      });
    });

    it('deve retornar válido para números', () => {
      expect(basicValidators.number('123')).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.number(456)).toEqual({
        isValid: true,
        error: null,
      });
      expect(basicValidators.number(-789)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('min', () => {
    it('deve retornar erro para valores menores que o mínimo', () => {
      const validator = basicValidators.min(10);
      expect(validator(5)).toEqual({
        isValid: false,
        error: 'Deve ser maior ou igual a 10',
      });
    });

    it('deve retornar válido para valores adequados', () => {
      const validator = basicValidators.min(10);
      expect(validator(10)).toEqual({
        isValid: true,
        error: null,
      });
      expect(validator(15)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('max', () => {
    it('deve retornar erro para valores maiores que o máximo', () => {
      const validator = basicValidators.max(100);
      expect(validator(150)).toEqual({
        isValid: false,
        error: 'Deve ser menor ou igual a 100',
      });
    });

    it('deve retornar válido para valores adequados', () => {
      const validator = basicValidators.max(100);
      expect(validator(50)).toEqual({
        isValid: true,
        error: null,
      });
      expect(validator(100)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('pattern', () => {
    it('deve retornar erro para padrões não correspondentes', () => {
      const validator = basicValidators.pattern(/^\d+$/, 'Apenas números');
      expect(validator('abc123')).toEqual({
        isValid: false,
        error: 'Apenas números',
      });
    });

    it('deve retornar válido para padrões correspondentes', () => {
      const validator = basicValidators.pattern(/^\d+$/, 'Apenas números');
      expect(validator('123456')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });
});

describe('photoValidators', () => {
  describe('title', () => {
    it('deve retornar erro para títulos muito curtos', () => {
      expect(photoValidators.title('ab')).toEqual({
        isValid: false,
        error: 'Título deve ter entre 3 e 100 caracteres',
      });
    });

    it('deve retornar erro para títulos muito longos', () => {
      const longTitle = 'a'.repeat(101);
      expect(photoValidators.title(longTitle)).toEqual({
        isValid: false,
        error: 'Título deve ter entre 3 e 100 caracteres',
      });
    });

    it('deve retornar válido para títulos adequados', () => {
      expect(photoValidators.title('Minha Foto')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('fileSize', () => {
    it('deve retornar erro para arquivos muito grandes', () => {
      const largeSize = 15 * 1024 * 1024; // 15MB
      expect(photoValidators.fileSize(largeSize)).toEqual({
        isValid: false,
        error: 'Arquivo deve ter no máximo 10MB',
      });
    });

    it('deve retornar válido para arquivos de tamanho adequado', () => {
      const validSize = 5 * 1024 * 1024; // 5MB
      expect(photoValidators.fileSize(validSize)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('imageFormat', () => {
    it('deve retornar erro para formatos inválidos', () => {
      expect(photoValidators.imageFormat('document.pdf')).toEqual({
        isValid: false,
        error: 'Formato deve ser JPG, PNG, WEBP ou HEIC',
      });
      expect(photoValidators.imageFormat('video.mp4')).toEqual({
        isValid: false,
        error: 'Formato deve ser JPG, PNG, WEBP ou HEIC',
      });
    });

    it('deve retornar válido para formatos corretos', () => {
      expect(photoValidators.imageFormat('photo.jpg')).toEqual({
        isValid: true,
        error: null,
      });
      expect(photoValidators.imageFormat('image.png')).toEqual({
        isValid: true,
        error: null,
      });
      expect(photoValidators.imageFormat('pic.webp')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('coordinates', () => {
    it('deve retornar erro para coordenadas inválidas', () => {
      expect(photoValidators.coordinates(91, 0)).toEqual({
        isValid: false,
        error: 'Coordenadas inválidas',
      });
      expect(photoValidators.coordinates(0, 181)).toEqual({
        isValid: false,
        error: 'Coordenadas inválidas',
      });
    });

    it('deve retornar válido para coordenadas corretas', () => {
      expect(photoValidators.coordinates(-23.5505, -46.6333)).toEqual({
        isValid: true,
        error: null,
      });
      expect(photoValidators.coordinates(0, 0)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });
});

describe('formValidators', () => {
  describe('searchText', () => {
    it('deve retornar erro para texto muito curto', () => {
      expect(formValidators.searchText('ab')).toEqual({
        isValid: false,
        error: 'Busca deve ter pelo menos 3 caracteres',
      });
    });

    it('deve retornar válido para texto adequado', () => {
      expect(formValidators.searchText('paisagem')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('dateRange', () => {
    it('deve retornar erro para data inicial posterior à final', () => {
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');
      expect(formValidators.dateRange(startDate, endDate)).toEqual({
        isValid: false,
        error: 'Data inicial deve ser anterior à data final',
      });
    });

    it('deve retornar válido para intervalo correto', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      expect(formValidators.dateRange(startDate, endDate)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('locationRadius', () => {
    it('deve retornar erro para raio muito pequeno', () => {
      expect(formValidators.locationRadius(0.5)).toEqual({
        isValid: false,
        error: 'Raio deve estar entre 1 e 100 km',
      });
    });

    it('deve retornar erro para raio muito grande', () => {
      expect(formValidators.locationRadius(150)).toEqual({
        isValid: false,
        error: 'Raio deve estar entre 1 e 100 km',
      });
    });

    it('deve retornar válido para raio adequado', () => {
      expect(formValidators.locationRadius(10)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });
});

describe('settingsValidators', () => {
  describe('theme', () => {
    it('deve retornar erro para tema inválido', () => {
      expect(settingsValidators.theme('invalid')).toEqual({
        isValid: false,
        error: 'Tema deve ser light, dark ou auto',
      });
    });

    it('deve retornar válido para temas corretos', () => {
      expect(settingsValidators.theme('light')).toEqual({
        isValid: true,
        error: null,
      });
      expect(settingsValidators.theme('dark')).toEqual({
        isValid: true,
        error: null,
      });
      expect(settingsValidators.theme('auto')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('language', () => {
    it('deve retornar erro para idioma inválido', () => {
      expect(settingsValidators.language('invalid')).toEqual({
        isValid: false,
        error: 'Idioma deve ser pt-BR ou en-US',
      });
    });

    it('deve retornar válido para idiomas corretos', () => {
      expect(settingsValidators.language('pt-BR')).toEqual({
        isValid: true,
        error: null,
      });
      expect(settingsValidators.language('en-US')).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe('cacheSize', () => {
    it('deve retornar erro para tamanho muito pequeno', () => {
      expect(settingsValidators.cacheSize(5)).toEqual({
        isValid: false,
        error: 'Cache deve estar entre 10MB e 1GB',
      });
    });

    it('deve retornar erro para tamanho muito grande', () => {
      expect(settingsValidators.cacheSize(1500)).toEqual({
        isValid: false,
        error: 'Cache deve estar entre 10MB e 1GB',
      });
    });

    it('deve retornar válido para tamanho adequado', () => {
      expect(settingsValidators.cacheSize(100)).toEqual({
        isValid: true,
        error: null,
      });
    });
  });
});

describe('validateValue', () => {
  it('deve aplicar múltiplos validadores', () => {
    const rules = [
      basicValidators.required,
      basicValidators.minLength(5),
      basicValidators.email,
    ];

    expect(validateValue('', rules)).toEqual({
      isValid: false,
      errors: ['Este campo é obrigatório'],
    });

    expect(validateValue('abc', rules)).toEqual({
      isValid: false,
      errors: ['Deve ter pelo menos 5 caracteres', 'Email inválido'],
    });

    expect(validateValue('test@example.com', rules)).toEqual({
      isValid: true,
      errors: [],
    });
  });

  it('deve parar na primeira validação que falhar quando stopOnFirstError for true', () => {
    const rules = [
      basicValidators.required,
      basicValidators.minLength(5),
      basicValidators.email,
    ];

    expect(validateValue('abc', rules, true)).toEqual({
      isValid: false,
      errors: ['Deve ter pelo menos 5 caracteres'],
    });
  });
});

describe('validateObject', () => {
  it('deve validar objeto com múltiplos campos', () => {
    const data = {
      name: '',
      email: 'invalid-email',
      age: 15,
    };

    const rules = {
      name: [basicValidators.required, basicValidators.minLength(2)],
      email: [basicValidators.required, basicValidators.email],
      age: [basicValidators.required, basicValidators.min(18)],
    };

    const result = validateObject(data, rules);

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toContain('Este campo é obrigatório');
    expect(result.errors.email).toContain('Email inválido');
    expect(result.errors.age).toContain('Deve ser maior ou igual a 18');
  });

  it('deve retornar válido para objeto correto', () => {
    const data = {
      name: 'João Silva',
      email: 'joao@example.com',
      age: 25,
    };

    const rules = {
      name: [basicValidators.required, basicValidators.minLength(2)],
      email: [basicValidators.required, basicValidators.email],
      age: [basicValidators.required, basicValidators.min(18)],
    };

    const result = validateObject(data, rules);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

describe('useValidation', () => {
  it('deve gerenciar estado de validação', () => {
    const rules = {
      email: [basicValidators.required, basicValidators.email],
    };

    const { result } = renderHook(() => useValidation(rules));

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.validate('email', 'invalid-email');
    });

    expect(result.current.errors.email).toContain('Email inválido');
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.validate('email', 'valid@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it('deve validar todos os campos', () => {
    const rules = {
      name: [basicValidators.required],
      email: [basicValidators.required, basicValidators.email],
    };

    const { result } = renderHook(() => useValidation(rules));

    act(() => {
      const isValid = result.current.validateAll({
        name: '',
        email: 'invalid',
      });
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.name).toContain('Este campo é obrigatório');
    expect(result.current.errors.email).toContain('Email inválido');
  });

  it('deve limpar erros', () => {
    const rules = {
      email: [basicValidators.required, basicValidators.email],
    };

    const { result } = renderHook(() => useValidation(rules));

    act(() => {
      result.current.validate('email', 'invalid');
    });

    expect(result.current.errors.email).toBeDefined();

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('deve limpar erro de campo específico', () => {
    const rules = {
      name: [basicValidators.required],
      email: [basicValidators.required],
    };

    const { result } = renderHook(() => useValidation(rules));

    act(() => {
      result.current.validate('name', '');
      result.current.validate('email', '');
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.email).toBeDefined();

    act(() => {
      result.current.clearFieldError('name');
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeDefined();
  });
});