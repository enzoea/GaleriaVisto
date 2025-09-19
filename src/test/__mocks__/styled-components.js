const React = require('react');

// Mock para styled-components
const mockStyledComponent = (Component) => {
  const StyledComponent = React.forwardRef((props, ref) => {
    return React.createElement(Component, { ...props, ref });
  });
  
  StyledComponent.withConfig = () => StyledComponent;
  StyledComponent.attrs = () => StyledComponent;
  
  return StyledComponent;
};

// Função que cria um handler para template literals com suporte a generics
const createStyledHandler = (Component) => {
  // Função principal que funciona como template literal
  const styledHandler = (strings, ...values) => mockStyledComponent(Component);
  
  // Adicionar métodos do styled-components
  styledHandler.withConfig = () => styledHandler;
  styledHandler.attrs = () => styledHandler;
  
  // Suporte para generics TypeScript - retorna a própria função
  const genericHandler = () => styledHandler;
  genericHandler.withConfig = () => genericHandler;
  genericHandler.attrs = () => genericHandler;
  
  // Combinar funcionalidades
  Object.assign(styledHandler, genericHandler);
  
  return styledHandler;
};

// Proxy para capturar propriedades como View, Text, etc.
const styledProxy = new Proxy({}, {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      return createStyledHandler(prop);
    }
    return undefined;
  }
});

// Função principal que funciona tanto como função quanto como objeto
const styledFunction = (Component) => createStyledHandler(Component);

// Adicionar todas as propriedades do proxy à função
Object.setPrototypeOf(styledFunction, styledProxy);
Object.assign(styledFunction, styledProxy);

// Adicionar propriedades específicas
styledFunction.View = createStyledHandler('View');
styledFunction.Text = createStyledHandler('Text');
styledFunction.TouchableOpacity = createStyledHandler('TouchableOpacity');
styledFunction.Pressable = createStyledHandler('Pressable');
styledFunction.ScrollView = createStyledHandler('ScrollView');

module.exports = {
  default: styledFunction,
  ThemeProvider: ({ children }) => children,
};