# GaleriaVisto

Uma aplicação moderna de galeria de fotos desenvolvida com React Native e Expo, oferecendo uma experiência rica e intuitiva para captura, comparação, visualização e compartilhamento de fotos.

## Funcionalidades Principais

### Captura de Fotos
- **Câmera Integrada**: Interface nativa para captura de fotos com controles intuitivos
- **Metadados Automáticos**: Captura automática de localização, data e hora
- **Títulos Personalizados**: Adicione títulos personalizados às suas fotos
- **Permissões Inteligentes**: Gerenciamento automático de permissões de câmera e localização

### Galeria Avançada
- **Grid Responsivo**: Layout adaptativo com suporte a múltiplas colunas
- **Visualização Detalhada**: Tela dedicada para visualização completa das fotos
- **Informações Técnicas**: Exibição de metadados como dimensões, tamanho e localização
- **Compartilhamento**: Funcionalidade nativa de compartilhamento de fotos

### Sistema de Filtros
- **Busca por Texto**: Pesquise fotos pelos títulos
- **Filtros por Data**: Filtre fotos por período específico
- **Filtros por Localização**: Encontre fotos com ou sem dados de localização
- **Filtros Avançados**: Interface modal com múltiplas opções de filtro
- **Contadores Dinâmicos**: Visualize quantas fotos correspondem aos filtros aplicados

### Temas e Interface
- **Modo Escuro/Claro**: Alternância entre temas com persistência
- **Design System**: Sistema de design consistente com tokens centralizados
- **Animações Fluidas**: Transições suaves e feedback visual refinado
- **UX Responsiva**: Interface adaptativa para diferentes tamanhos de tela

### Performance e Otimização
- **Virtualização**: Renderização otimizada para listas grandes
- **Memoização**: Componentes otimizados com React.memo
- **Cache Inteligente**: Sistema de cache para melhor performance
- **Lazy Loading**: Carregamento sob demanda de componentes

## Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **Styled Components** - Estilização
- **Expo Router** - Navegação
- **Expo Camera** - Captura de fotos
- **Expo Location** - Geolocalização
- **AsyncStorage** - Persistência local
- **React Native Reanimated** - Animações
- **Jest & Testing Library** - Testes

## Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo físico ou emulador

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/enzoea/GaleriaVisto.git
cd GaleriaVisto
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Inicie o projeto**
```bash
npm start
# ou
yarn start
# ou
npx expo start
```

### Usando com Expo

1. **Instale o Expo Go** no seu dispositivo móvel:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Execute o projeto**
```bash
npx expo start
```

3. **Conecte seu dispositivo**
   - Escaneie o QR code com o Expo Go (Android) ou câmera (iOS)
   - Ou use o emulador com `npx expo start --android` ou `npx expo start --ios`

### Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run android    # Executa no emulador Android
npm run ios        # Executa no simulador iOS
npm run web        # Executa na web
npm test           # Executa os testes
npm run test:watch # Executa os testes em modo watch
npm run test:coverage # Gera relatório de cobertura
```

## Pontos de Avaliação do Projeto

### Entrega de Funcionalidades

**✅ Funcionalidades Implementadas:**
- ✅ Captura de fotos com câmera nativa
- ✅ Galeria com grid responsivo
- ✅ Sistema completo de filtros (texto, data, localização)
- ✅ Visualização detalhada de fotos
- ✅ Compartilhamento de fotos
- ✅ Temas claro/escuro
- ✅ Persistência de dados local
- ✅ Metadados automáticos (localização, timestamp)
- ✅ Interface responsiva e adaptativa

**Funcionalidades Avançadas:**
- ✅ Animações e transições fluidas
- ✅ Sistema de cache otimizado
- ✅ Virtualização para performance
- ✅ Feedback visual
- ✅ Tratamento de erros robusto

### Estruturação de Código / Clean Code

**Arquitetura:**
- ✅ **Clean Architecture** com separação clara de responsabilidades
- ✅ **Domain Layer** - Entidades e regras de negócio puras
- ✅ **Data Layer** - Repositórios e fontes de dados
- ✅ **Presentation Layer** - UI e lógica de apresentação
- ✅ **Infrastructure Layer** - Integrações externas

**Padrões de Código:**
- ✅ **TypeScript** com tipagem estrita
- ✅ **Nomenclatura consistente** (PascalCase, camelCase, UPPER_SNAKE_CASE)
- ✅ **Separação de responsabilidades** clara
- ✅ **Componentes reutilizáveis** e modulares
- ✅ **Hooks customizados** para lógica compartilhada
- ✅ **Design System** centralizado

**Organização:**
```
src/
├── domain/         # Regras de negócio
├── data/           # Repositórios e storage
├── presentation/   # UI e componentes
├── infrastructure/ # Integrações externas
├── utils/          # Utilitários
└── test/           # Testes organizados
```

### Performance e Boas Práticas

**Otimizações Implementadas:**
- ✅ **React.memo** para componentes puros
- ✅ **useMemo/useCallback** para cálculos custosos
- ✅ **Virtualização** com FlatList otimizada
- ✅ **Lazy Loading** de componentes
- ✅ **Cache inteligente** para imagens
- ✅ **Debounce** em filtros de busca

**Boas Práticas:**
- ✅ **Gerenciamento de estado** com Context API
- ✅ **Tratamento de erros** centralizado
- ✅ **Accessibility** com labels e hints
- ✅ **Responsive Design** adaptativo
- ✅ **Offline Support** com AsyncStorage
- ✅ **Memory Management** otimizado

### 🧪 Testes de Unidade

**Cobertura de Testes:**
- ✅ **Componentes UI** - PhotoCard, PhotoGrid, Filtros
- ✅ **Hooks Customizados** - usePhotoFilters, usePhotosEnhanced
- ✅ **Utilitários** - Formatters, Helpers
- ✅ **Mocks Completos** - React Native, Expo, AsyncStorage

**Ferramentas de Teste:**
- ✅ **Jest** - Framework de testes
- ✅ **Testing Library** - Testes de componentes
- ✅ **React Test Renderer** - Snapshots
- ✅ **Setup Customizado** - Mocks e configurações

**Comandos de Teste:**
```bash
npm test              # Executa todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura
```

### Animações, Feedbacks Visuais e UX Refinada

**Animações Implementadas:**
- ✅ **Transições de tela** suaves com React Navigation
- ✅ **Animações de entrada** para cards de fotos
- ✅ **Feedback tátil** com Expo Haptics
- ✅ **Loading states** animados
- ✅ **Modais animados** com slide e fade
- ✅ **Botões com feedback** visual (scale, opacity)

**UX Refinada:**
- ✅ **Estados de loading** consistentes
- ✅ **Mensagens de erro** informativas
- ✅ **Empty states** com call-to-action
- ✅ **Pull-to-refresh** nativo
- ✅ **Navegação intuitiva** com breadcrumbs
- ✅ **Feedback visual** para todas as ações

**Design System:**
- ✅ **Tokens centralizados** (cores, espaçamentos, tipografia)
- ✅ **Componentes base** reutilizáveis
- ✅ **Temas consistentes** claro/escuro
- ✅ **Iconografia** padronizada com Expo Vector Icons

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Autor

Desenvolvido por Enzo Martins para demonstrar habilidades em React Native, TypeScript e desenvolvimento mobile moderno.
