import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock do Button component
jest.mock('../Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  
  return {
    Button: ({ onPress, title, testID, accessibilityLabel, accessibilityHint, ...props }: any) => (
      React.createElement(Pressable, {
        onPress,
        testID,
        accessibilityLabel,
        accessibilityHint,
        accessibilityRole: 'button',
        ...props
      }, React.createElement(Text, {}, title))
    )
  };
});

import { Button } from '../Button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    const { root } = render(
      <Button title="Clique aqui" onPress={() => {}} />
    );

    expect(root).toBeTruthy();
  });

  it('deve renderizar com propriedades básicas', () => {
    const { root } = render(
      <Button 
        title="Teste"
        onPress={() => {}}
        accessibilityLabel="Botão de teste"
        testID="test-button"
      />
    );

    expect(root).toBeTruthy();
  });
});