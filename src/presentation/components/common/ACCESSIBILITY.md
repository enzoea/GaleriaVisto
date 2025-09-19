# Melhorias de Acessibilidade (a11y)

Este documento descreve as melhorias de acessibilidade implementadas nos componentes da aplicação.

## Componentes Atualizados

### Button
- **accessibilityLabel**: Texto para leitores de tela
- **accessibilityHint**: Dica de acessibilidade
- **accessibilityRole**: Papel do elemento ('button' ou 'link')
- **accessibilityState**: Estado do botão (disabled, busy)

### Input
- **accessibilityLabel**: Texto para leitores de tela (usa label como fallback)
- **accessibilityHint**: Dica de acessibilidade (usa hint como fallback)
- **accessibilityRole**: Definido como 'text'
- **accessibilityState**: Estado do input (disabled)

### Modal
- **accessibilityLabel**: Texto para leitores de tela (usa title como fallback)
- **accessibilityHint**: Dica de acessibilidade
- **accessibilityRole**: Definido como 'dialog'
- **accessibilityViewIsModal**: Indica que é um modal

### ThemeDebug
- Botões com **accessibilityRole**, **accessibilityLabel** e **accessibilityHint**
- Descrições claras para cada ação de tema

### Collapsible
- **accessibilityRole**: Definido como 'button'
- **accessibilityLabel**: Indica se vai expandir ou recolher
- **accessibilityHint**: Explica a ação
- **accessibilityState**: Indica se está expandido

## Benefícios

1. **Leitores de Tela**: Componentes agora fornecem informações claras para usuários com deficiência visual
2. **Navegação por Teclado**: Elementos são identificados corretamente
3. **Estados Dinâmicos**: Estados como disabled, busy, expanded são comunicados
4. **Contexto**: Usuários entendem o propósito e resultado das ações

## Uso

```tsx
// Exemplo de uso com acessibilidade
<Button
  title="Salvar"
  onPress={handleSave}
  accessibilityLabel="Salvar documento"
  accessibilityHint="Salva as alterações feitas no documento"
  loading={isSaving}
/>

<Input
  label="Email"
  accessibilityLabel="Campo de email"
  accessibilityHint="Digite seu endereço de email"
  placeholder="exemplo@email.com"
/>

<Modal
  visible={showModal}
  title="Confirmar ação"
  accessibilityLabel="Modal de confirmação"
  accessibilityHint="Modal para confirmar a ação solicitada"
>
  {/* conteúdo */}
</Modal>
```

## Próximos Passos

- Implementar testes de acessibilidade
- Adicionar suporte a navegação por teclado
- Implementar foco automático em modais
- Adicionar indicadores visuais para foco