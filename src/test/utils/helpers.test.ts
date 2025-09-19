import {
  dateUtils,
  fileUtils,
  locationUtils,
  stringUtils,
  arrayUtils,
  performanceUtils,
  validationUtils,
  colorUtils,
} from '../../utils/helpers';

describe('dateUtils', () => {
  const testTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC

  describe('formatDate', () => {
    it('deve formatar data no formato curto', () => {
      const result = dateUtils.formatDate(testTimestamp, 'short');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve formatar data no formato longo', () => {
      const result = dateUtils.formatDate(testTimestamp, 'long');
      expect(result).toContain('2022');
    });

    it('deve formatar data no formato relativo', () => {
      const now = Date.now();
      const yesterday = now - (24 * 60 * 60 * 1000);
      const result = dateUtils.formatDate(yesterday, 'relative');
      expect(result).toBe('Ontem');
    });
  });

  describe('isToday', () => {
    it('deve retornar true para timestamp de hoje', () => {
      const today = Date.now();
      expect(dateUtils.isToday(today)).toBe(true);
    });

    it('deve retornar false para timestamp de ontem', () => {
      const yesterday = Date.now() - (24 * 60 * 60 * 1000);
      expect(dateUtils.isToday(yesterday)).toBe(false);
    });
  });

  describe('getTimeAgo', () => {
    it('deve retornar "Agora" para timestamp muito recente', () => {
      const now = Date.now();
      expect(dateUtils.getTimeAgo(now)).toBe('Agora');
    });

    it('deve retornar minutos para timestamp de alguns minutos atrás', () => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      expect(dateUtils.getTimeAgo(fiveMinutesAgo)).toBe('5m');
    });

    it('deve retornar horas para timestamp de algumas horas atrás', () => {
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      expect(dateUtils.getTimeAgo(twoHoursAgo)).toBe('2h');
    });
  });
});

describe('fileUtils', () => {
  describe('getFileExtension', () => {
    it('deve extrair extensão corretamente', () => {
      expect(fileUtils.getFileExtension('photo.jpg')).toBe('jpg');
      expect(fileUtils.getFileExtension('document.pdf')).toBe('pdf');
      expect(fileUtils.getFileExtension('file.name.with.dots.png')).toBe('png');
    });

    it('deve retornar string vazia para arquivo sem extensão', () => {
      expect(fileUtils.getFileExtension('filename')).toBe('');
    });
  });

  describe('isValidImageFormat', () => {
    it('deve retornar true para formatos válidos', () => {
      expect(fileUtils.isValidImageFormat('photo.jpg')).toBe(true);
      expect(fileUtils.isValidImageFormat('image.png')).toBe(true);
      expect(fileUtils.isValidImageFormat('pic.webp')).toBe(true);
    });

    it('deve retornar false para formatos inválidos', () => {
      expect(fileUtils.isValidImageFormat('document.pdf')).toBe(false);
      expect(fileUtils.isValidImageFormat('video.mp4')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar bytes corretamente', () => {
      expect(fileUtils.formatFileSize(0)).toBe('0 B');
      expect(fileUtils.formatFileSize(1024)).toBe('1 KB');
      expect(fileUtils.formatFileSize(1048576)).toBe('1 MB');
      expect(fileUtils.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('deve formatar tamanhos decimais', () => {
      expect(fileUtils.formatFileSize(1536)).toBe('1.5 KB');
      expect(fileUtils.formatFileSize(2621440)).toBe('2.5 MB');
    });
  });

  describe('generateUniqueFilename', () => {
    it('deve gerar nome único com extensão', () => {
      const filename = fileUtils.generateUniqueFilename('jpg');
      expect(filename).toMatch(/^photo_\d+_[a-z0-9]+\.jpg$/);
    });

    it('deve gerar nomes diferentes em chamadas consecutivas', () => {
      const filename1 = fileUtils.generateUniqueFilename('png');
      const filename2 = fileUtils.generateUniqueFilename('png');
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('isFileSizeValid', () => {
    it('deve retornar true para tamanhos válidos', () => {
      const validSize = 5 * 1024 * 1024; // 5MB
      expect(fileUtils.isFileSizeValid(validSize)).toBe(true);
    });

    it('deve retornar false para tamanhos muito grandes', () => {
      const invalidSize = 15 * 1024 * 1024; // 15MB
      expect(fileUtils.isFileSizeValid(invalidSize)).toBe(false);
    });
  });
});

describe('locationUtils', () => {
  describe('calculateDistance', () => {
    it('deve calcular distância entre coordenadas', () => {
      // São Paulo para Rio de Janeiro (aproximadamente 360km)
      const distance = locationUtils.calculateDistance(
        -23.5505, -46.6333, // São Paulo
        -22.9068, -43.1729  // Rio de Janeiro
      );
      expect(distance).toBeCloseTo(357, 0); // Aproximadamente 357km
    });

    it('deve retornar 0 para coordenadas idênticas', () => {
      const distance = locationUtils.calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });
  });

  describe('formatCoordinates', () => {
    it('deve formatar coordenadas com precisão padrão', () => {
      const result = locationUtils.formatCoordinates(-23.5505, -46.6333);
      expect(result).toBe('-23.5505, -46.6333');
    });

    it('deve formatar coordenadas com precisão customizada', () => {
      const result = locationUtils.formatCoordinates(-23.5505, -46.6333, 2);
      expect(result).toBe('-23.55, -46.63');
    });
  });

  describe('isValidCoordinate', () => {
    it('deve retornar true para coordenadas válidas', () => {
      expect(locationUtils.isValidCoordinate(-23.5505, -46.6333)).toBe(true);
      expect(locationUtils.isValidCoordinate(0, 0)).toBe(true);
      expect(locationUtils.isValidCoordinate(90, 180)).toBe(true);
      expect(locationUtils.isValidCoordinate(-90, -180)).toBe(true);
    });

    it('deve retornar false para coordenadas inválidas', () => {
      expect(locationUtils.isValidCoordinate(91, 0)).toBe(false);
      expect(locationUtils.isValidCoordinate(-91, 0)).toBe(false);
      expect(locationUtils.isValidCoordinate(0, 181)).toBe(false);
      expect(locationUtils.isValidCoordinate(0, -181)).toBe(false);
    });
  });
});

describe('stringUtils', () => {
  describe('truncate', () => {
    it('deve truncar string longa', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado';
      const result = stringUtils.truncate(longText, 20);
      expect(result).toBe('Este é um texto m...');
    });

    it('deve retornar string original se menor que limite', () => {
      const shortText = 'Texto curto';
      const result = stringUtils.truncate(shortText, 20);
      expect(result).toBe('Texto curto');
    });

    it('deve usar sufixo customizado', () => {
      const text = 'Texto para truncar';
      const result = stringUtils.truncate(text, 10, ' [...]');
      expect(result).toBe('Texto [...]');
    });
  });

  describe('capitalize', () => {
    it('deve capitalizar primeira letra', () => {
      expect(stringUtils.capitalize('hello')).toBe('Hello');
      expect(stringUtils.capitalize('WORLD')).toBe('World');
      expect(stringUtils.capitalize('tEST')).toBe('Test');
    });
  });

  describe('slugify', () => {
    it('deve criar slug válido', () => {
      expect(stringUtils.slugify('Hello World')).toBe('hello-world');
      expect(stringUtils.slugify('Título com Acentos')).toBe('titulo-com-acentos');
      expect(stringUtils.slugify('Text with @#$ special chars!')).toBe('text-with-special-chars');
    });
  });

  describe('isValidEmail', () => {
    it('deve validar emails corretos', () => {
      expect(stringUtils.isValidEmail('test@example.com')).toBe(true);
      expect(stringUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(stringUtils.isValidEmail('invalid-email')).toBe(false);
      expect(stringUtils.isValidEmail('test@')).toBe(false);
      expect(stringUtils.isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = stringUtils.generateId();
      const id2 = stringUtils.generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });
});

describe('arrayUtils', () => {
  describe('chunk', () => {
    it('deve dividir array em chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = arrayUtils.chunk(array, 3);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('deve retornar array vazio para entrada vazia', () => {
      const result = arrayUtils.chunk([], 3);
      expect(result).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('deve embaralhar array mantendo todos elementos', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = arrayUtils.shuffle(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
      expect(shuffled).not.toBe(original); // Não deve modificar original
    });
  });

  describe('unique', () => {
    it('deve remover duplicatas de array simples', () => {
      const array = [1, 2, 2, 3, 3, 3, 4];
      const result = arrayUtils.unique(array);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('deve remover duplicatas por chave de objeto', () => {
      const array = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ];
      const result = arrayUtils.unique(array, 'id');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('groupBy', () => {
    it('deve agrupar objetos por chave', () => {
      const array = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      const result = arrayUtils.groupBy(array, 'category');
      
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
      expect(result.A[0].value).toBe(1);
      expect(result.A[1].value).toBe(3);
    });
  });

  describe('sortBy', () => {
    it('deve ordenar array por chave ascendente', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const result = arrayUtils.sortBy(array, 'age', 'asc');
      
      expect(result[0].age).toBe(25);
      expect(result[1].age).toBe(30);
      expect(result[2].age).toBe(35);
    });

    it('deve ordenar array por chave descendente', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const result = arrayUtils.sortBy(array, 'age', 'desc');
      
      expect(result[0].age).toBe(35);
      expect(result[1].age).toBe(30);
      expect(result[2].age).toBe(25);
    });
  });
});

describe('performanceUtils', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    it('deve atrasar execução da função', () => {
      const mockFn = jest.fn();
      const debouncedFn = performanceUtils.debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('deve cancelar execução anterior se chamada novamente', () => {
      const mockFn = jest.fn();
      const debouncedFn = performanceUtils.debounce(mockFn, 100);

      debouncedFn('first');
      jest.advanceTimersByTime(50);
      debouncedFn('second');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('deve limitar execução da função', () => {
      const mockFn = jest.fn();
      const throttledFn = performanceUtils.throttle(mockFn, 100);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      jest.advanceTimersByTime(100);
      throttledFn('fourth');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });
  });

  describe('memoize', () => {
    it('deve cachear resultado da função', () => {
      const expensiveFn = jest.fn((x: number) => x * 2);
      const memoizedFn = performanceUtils.memoize(expensiveFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('deve calcular novamente para argumentos diferentes', () => {
      const expensiveFn = jest.fn((x: number) => x * 2);
      const memoizedFn = performanceUtils.memoize(expensiveFn);

      memoizedFn(5);
      memoizedFn(10);

      expect(expensiveFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('validationUtils', () => {
  describe('isRequired', () => {
    it('deve retornar true para valores válidos', () => {
      expect(validationUtils.isRequired('text')).toBe(true);
      expect(validationUtils.isRequired(0)).toBe(true);
      expect(validationUtils.isRequired(false)).toBe(true);
    });

    it('deve retornar false para valores inválidos', () => {
      expect(validationUtils.isRequired(null)).toBe(false);
      expect(validationUtils.isRequired(undefined)).toBe(false);
      expect(validationUtils.isRequired('')).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('deve retornar true para números válidos', () => {
      expect(validationUtils.isNumber(123)).toBe(true);
      expect(validationUtils.isNumber('456')).toBe(true);
      expect(validationUtils.isNumber(0)).toBe(true);
      expect(validationUtils.isNumber(-123)).toBe(true);
    });

    it('deve retornar false para não-números', () => {
      expect(validationUtils.isNumber('abc')).toBe(false);
      expect(validationUtils.isNumber(NaN)).toBe(false);
      expect(validationUtils.isNumber(Infinity)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('deve retornar true para URLs válidas', () => {
      expect(validationUtils.isValidUrl('https://example.com')).toBe(true);
      expect(validationUtils.isValidUrl('http://test.org/path')).toBe(true);
    });

    it('deve retornar false para URLs inválidas', () => {
      expect(validationUtils.isValidUrl('not-a-url')).toBe(false);
      expect(validationUtils.isValidUrl('ftp://invalid')).toBe(false);
    });
  });
});

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('deve converter hex para RGB', () => {
      const result = colorUtils.hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('deve funcionar sem # no início', () => {
      const result = colorUtils.hexToRgb('00FF00');
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('deve retornar null para hex inválido', () => {
      const result = colorUtils.hexToRgb('invalid');
      expect(result).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('deve converter RGB para hex', () => {
      const result = colorUtils.rgbToHex(255, 0, 0);
      expect(result).toBe('#ff0000');
    });

    it('deve funcionar com valores zero', () => {
      const result = colorUtils.rgbToHex(0, 0, 0);
      expect(result).toBe('#000000');
    });
  });

  describe('isDarkColor', () => {
    it('deve identificar cores escuras', () => {
      expect(colorUtils.isDarkColor('#000000')).toBe(true);
      expect(colorUtils.isDarkColor('#333333')).toBe(true);
    });

    it('deve identificar cores claras', () => {
      expect(colorUtils.isDarkColor('#FFFFFF')).toBe(false);
      expect(colorUtils.isDarkColor('#CCCCCC')).toBe(false);
    });
  });
});