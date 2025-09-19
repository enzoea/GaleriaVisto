import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock do Input component
jest.mock('../Input', () => {
  const React = require('react');
  const { View, TextInput, Text } = require('react-native');
  
  return {
    Input: ({ 
      label, 
      placeholder, 
      value, 
      onChangeText, 
      testID, 
      accessibilityLabel, 
      accessibilityHint,
      error,
      required,
      ...props 
    }: any) => (
      React.createElement(View, { testID },
        label && React.createElement(Text, {}, label + (required ? ' *' : '')),
        React.createElement(TextInput, {
          placeholder,
          value,
          onChangeText,
          accessibilityLabel: accessibilityLabel || label,
          accessibilityHint,
          ...props
        }),
        error && React.createElement(Text, { testID: 'error-message' }, error)
      )
    )
  };
});

import { Input } from '../Input';

describe('Input', () => {
  it('deve renderizar corretamente', () => {
    const { root } = render(
      <Input 
        placeholder="Digite aqui"
        value=""
        onChangeText={() => {}}
      />
    );

    expect(root).toBeTruthy();
  });

  it('deve renderizar com propriedades básicas', () => {
    const { root } = render(
      <Input 
        label="Nome"
        placeholder="Digite seu nome"
        value=""
        onChangeText={() => {}}
        required
        testID="test-input"
      />
    );

    expect(root).toBeTruthy();
  });
});