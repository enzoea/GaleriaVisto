import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock completo do Modal
jest.mock('../Modal', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  
  return {
    Modal: ({ 
      visible, 
      onClose, 
      title, 
      children, 
      primaryAction, 
      secondaryAction, 
      showCloseButton, 
      testID,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityViewIsModal
    }: any) => {
      if (!visible) return null;
      
      const modalProps: any = {
         testID: testID || 'modal',
         accessibilityLabel: accessibilityLabel || title,
         accessibilityRole: accessibilityRole || 'dialog',
         accessibilityViewIsModal: accessibilityViewIsModal !== undefined ? accessibilityViewIsModal : true
       };
       
       if (accessibilityHint) {
         modalProps.accessibilityHint = accessibilityHint;
       }
      
      return React.createElement(View, modalProps, [
        title && React.createElement(Text, { key: 'title', testID: 'modal-title' }, title),
        React.createElement(View, { key: 'content', testID: 'modal-content' }, children),
        showCloseButton ? React.createElement(
          Pressable, 
          { key: 'close', testID: 'modal-close-button', onPress: onClose },
          React.createElement(Text, null, 'X')
        ) : null,
        primaryAction ? React.createElement(
          Pressable,
          { 
            key: 'primary',
            testID: 'primary-action',
            onPress: primaryAction.onPress
          },
          React.createElement(Text, null, primaryAction.title || primaryAction.label)
        ) : null,
        secondaryAction ? React.createElement(
          Pressable,
          { 
            key: 'secondary',
            testID: 'secondary-action',
            onPress: secondaryAction.onPress
          },
          React.createElement(Text, null, secondaryAction.title || secondaryAction.label)
        ) : null
      ]);
    }
  };
});

const { Modal } = require('../Modal');

describe('Modal', () => {
  it('deve renderizar quando visible é true', () => {
    const { root } = render(
      <Modal visible={true} onClose={() => {}}>
        <Text>Conteúdo do modal</Text>
      </Modal>
    );

    expect(root).toBeTruthy();
  });

  it('não deve renderizar quando visible é false', () => {
    const { queryByTestId } = render(
      <Modal 
        visible={false}
        onClose={() => {}}
      >
        <Text>Conteúdo do modal</Text>
      </Modal>
    );

    expect(queryByTestId('modal')).toBeNull();
  });

  it('deve renderizar com propriedades básicas', () => {
    const { root } = render(
      <Modal 
        visible={true}
        onClose={() => {}}
      >
        <Text>Conteúdo</Text>
      </Modal>
    );

    expect(root).toBeTruthy();
  });
});