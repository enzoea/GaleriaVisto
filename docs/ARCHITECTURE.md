# Arquitetura do Projeto - Galeria Visto

## Estrutura de Pastas

O projeto segue uma arquitetura limpa (Clean Architecture) com separação clara de responsabilidades:

```
src/
├── design-system/          # Sistema de design centralizado
│   ├── tokens.ts           # Design tokens (cores, espaçamentos, tipografia)
│   ├── components/         # Componentes do design system
│   └── themes/             # Temas e variações
│
├── domain/                 # Camada de domínio (regras de negócio)
│   ├── photo/              # Entidade Photo
│   │   ├── types.ts        # Tipos e interfaces
│   │   ├── repository.ts   # Contratos de repositório
│   │   └── Photo.ts        # Entidade principal
│   ├── user/               # Entidade User (futuro)
│   └── shared/             # Tipos compartilhados
│
├── data/                   # Camada de dados
│   ├── repositories/       # Implementações de repositórios
│   │   ├── PhotoRepositoryImpl.ts
│   │   ├── PhotoRepositoryEnhanced.ts
│   │   └── photo-repo.ts
│   ├── storage/            # Abstrações de armazenamento
│   │   ├── async.ts
│   │   └── cache.ts
│   ├── api/                # Clientes de API (futuro)
│   └── mappers/            # Mapeadores de dados
│
├── presentation/           # Camada de apresentação
│   ├── components/         # Componentes React
│   │   ├── base/           # Componentes base reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── photo/          # Componentes específicos de foto
│   │   │   ├── PhotoCard.tsx
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── PhotoModal.tsx
│   │   │   └── PhotoFilters.tsx
│   │   ├── layout/         # Componentes de layout
│   │   └── shared/         # Componentes compartilhados
│   │
│   ├── screens/            # Telas da aplicação
│   │   ├── GalleryScreen.tsx
│   │   ├── PhotoDetailsScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── contexts/           # Contextos React
│   │   ├── PhotoContext.tsx
│   │   ├── ErrorContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/              # Hooks customizados
│   │   ├── usePhotos.ts
│   │   ├── usePhotoFilters.ts
│   │   ├── useLocation.ts
│   │   └── useErrorHandler.ts
│   │
│   ├── providers/          # Providers React
│   │   ├── AppProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   └── navigation/         # Configuração de navegação
│       ├── AppNavigator.tsx
│       └── types.ts
│
├── infrastructure/         # Camada de infraestrutura
│   ├── storage/            # Implementações de storage
│   ├── network/            # Configurações de rede
│   ├── permissions/        # Gerenciamento de permissões
│   ├── analytics/          # Analytics e monitoring
│   └── offline/            # Suporte offline
│
├── utils/                  # Utilitários gerais
│   ├── constants.ts        # Constantes da aplicação
│   ├── helpers.ts          # Funções auxiliares
│   ├── validators.ts       # Validadores
│   └── formatters.ts       # Formatadores
│
├── test/                   # Testes
│   ├── __mocks__/          # Mocks para testes
│   ├── utils/              # Utilitários de teste
│   ├── setup.ts            # Configuração de testes
│   └── **/*.test.ts        # Arquivos de teste
│
└── types/                  # Tipos TypeScript globais
    ├── global.d.ts
    ├── styled.d.ts
    └── navigation.d.ts
```

## Princípios Arquiteturais

### 1. Clean Architecture
- **Domain**: Regras de negócio puras, independentes de frameworks
- **Data**: Implementações de repositórios e fontes de dados
- **Presentation**: UI e lógica de apresentação
- **Infrastructure**: Detalhes técnicos e integrações externas

### 2. Dependency Inversion
- Camadas internas não dependem de camadas externas
- Interfaces definidas no domínio, implementadas na infraestrutura
- Injeção de dependências através de contextos React

### 3. Single Responsibility
- Cada arquivo/classe tem uma única responsabilidade
- Separação clara entre lógica de negócio e apresentação
- Componentes focados e reutilizáveis

### 4. Design System
- Tokens centralizados para consistência visual
- Componentes base reutilizáveis
- Temas e variações padronizadas

## Padrões de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `PhotoCard.tsx`)
- **Hooks**: camelCase com prefixo "use" (ex: `usePhotos.ts`)
- **Contextos**: PascalCase com sufixo "Context" (ex: `PhotoContext.tsx`)
- **Tipos**: PascalCase (ex: `Photo`, `PhotoRepository`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_PHOTOS_PER_PAGE`)

### Estrutura de Arquivos
```typescript
// Imports externos
import React from 'react';
import { View } from 'react-native';

// Imports internos (ordem: domain -> data -> presentation -> utils)
import { Photo } from '../../domain/photo/types';
import { usePhotos } from '../hooks/usePhotos';
import { Button } from '../components/base';

// Tipos locais
interface ComponentProps {
  // ...
}

// Componente principal
export const Component: React.FC<ComponentProps> = () => {
  // ...
};

// Exports
export default Component;
export type { ComponentProps };
```

### Gerenciamento de Estado
- **Local**: useState, useReducer
- **Global**: Context API com providers
- **Servidor**: React Query (futuro)
- **Formulários**: React Hook Form (futuro)

### Tratamento de Erros
- Context centralizado para erros
- Boundary components para captura
- Logging estruturado
- Feedback visual consistente

### Performance
- Memoização com React.memo, useMemo, useCallback
- Lazy loading de componentes
- Otimização de imagens
- Virtualização de listas

### Testes
- Unit tests para lógica de negócio
- Integration tests para hooks
- Component tests para UI
- E2E tests para fluxos críticos

## Convenções de Desenvolvimento

### Git
- **Branches**: feature/nome-da-feature, fix/nome-do-bug
- **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)
- **PRs**: Template com checklist de qualidade

### TypeScript
- Strict mode habilitado
- Tipos explícitos para props e retornos
- Interfaces para objetos complexos
- Enums para constantes relacionadas

### Styling
- Design tokens para valores
- Styled components ou StyleSheet
- Responsive design com breakpoints
- Acessibilidade (a11y) considerada

### Documentação
- README atualizado
- Comentários JSDoc para funções complexas
- Storybook para componentes (futuro)
- Arquitetura documentada

## Próximos Passos

1. **Migração Gradual**: Mover componentes existentes para nova estrutura
2. **Testes Expandidos**: Aumentar cobertura de testes
3. **Performance**: Implementar otimizações identificadas
4. **Offline Support**: Adicionar funcionalidades offline
5. **Analytics**: Implementar tracking de eventos
6. **Acessibilidade**: Melhorar suporte a11y
7. **Documentação**: Expandir documentação técnica