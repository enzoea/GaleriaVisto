/**
 * Tela de Configurações
 * 
 * Demonstra o uso completo do sistema de temas e componentes
 * com suporte a dark mode, validação de props e acessibilidade
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../providers/ThemeProvider';
import { 
  Button, 
  Input, 
  Modal, 
  ThemeSelector, 
  SettingsPanel,
  UserSettings 
} from '../components/common';

const Container = styled(View)<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const Header = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(3)}px ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  ${({ theme }: { theme: DefaultTheme }) => `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 3;
  `}
`;

const HeaderTitle = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.xl}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  text-align: center;
`;

const Content = styled(ScrollView)<{ theme: DefaultTheme }>`
  flex: 1;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const Section = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.lg}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(3)}px;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const SectionTitle = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const SectionDescription = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.subtext};
  line-height: ${({ theme }: { theme: DefaultTheme }) => theme.typography.lineHeights.md}px;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(3)}px;
`;

const DemoContainer = styled(View)<{ theme: DefaultTheme }>`
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const ButtonRow = styled(View)<{ theme: DefaultTheme }>`
  flex-direction: row;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  flex-wrap: wrap;
`;

const ThemeInfo = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.md}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const ThemeInfoText = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.medium};
  text-align: center;
`;

/**
 * Tela de Configurações
 * 
 * Demonstra todos os componentes com suporte completo ao dark mode
 */
export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, isDark, getThemeModeLabel } = useThemeContext();
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSaveSettings = (settings: UserSettings) => {
    console.log('Configurações salvas:', settings);
    // Aqui você salvaria as configurações no storage/estado global
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) {
      setInputError('Este campo é obrigatório');
      return;
    }
    
    if (inputValue.length < 3) {
      setInputError('Mínimo de 3 caracteres');
      return;
    }

    setInputError('');
    setShowInputModal(false);
    setInputValue('');
    console.log('Valor enviado:', inputValue);
  };

  return (
    <Container>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      
      <Header>
        <HeaderTitle>Configurações</HeaderTitle>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* Informações do Tema Atual */}
        <Section>
          <SectionTitle>Tema Atual</SectionTitle>
          <ThemeInfo>
            <ThemeInfoText>
              {getThemeModeLabel()} {isDark ? '🌙' : '☀️'}
            </ThemeInfoText>
          </ThemeInfo>
          <SectionDescription>
            O tema atual é "{getThemeModeLabel().toLowerCase()}" e está sendo aplicado 
            automaticamente em todos os componentes da aplicação.
          </SectionDescription>
        </Section>

        {/* Demonstração de Botões */}
        <Section>
          <SectionTitle>Componentes Button</SectionTitle>
          <SectionDescription>
            Demonstração dos diferentes estilos e tamanhos de botões 
            com suporte completo ao dark mode.
          </SectionDescription>
          
          <DemoContainer>
            <ButtonRow>
              <Button 
                title="Primário" 
                variant="primary" 
                size="md"
                onPress={() => console.log('Botão primário')}
              />
              <Button 
                title="Secundário" 
                variant="secondary" 
                size="md"
                onPress={() => console.log('Botão secundário')}
              />
            </ButtonRow>
            
            <ButtonRow>
              <Button 
                title="Outline" 
                variant="outline" 
                size="sm"
                onPress={() => console.log('Botão outline')}
              />
              <Button 
                title="Ghost" 
                variant="ghost" 
                size="sm"
                onPress={() => console.log('Botão ghost')}
              />
              <Button 
                title="Danger" 
                variant="danger" 
                size="sm"
                onPress={() => console.log('Botão danger')}
              />
            </ButtonRow>
          </DemoContainer>
        </Section>

        {/* Demonstração de Inputs */}
        <Section>
          <SectionTitle>Componentes Input</SectionTitle>
          <SectionDescription>
            Diferentes variantes de input com validação e suporte ao dark mode.
          </SectionDescription>
          
          <DemoContainer>
            <Input
              label="Input Padrão"
              placeholder="Digite algo aqui..."
              variant="default"
              hint="Este é um input padrão"
            />
            
            <Input
              label="Input Preenchido"
              placeholder="Input com fundo preenchido"
              variant="filled"
              required
            />
            
            <Input
              label="Input com Borda"
              placeholder="Input com borda destacada"
              variant="outline"
              error="Exemplo de mensagem de erro"
            />
            
            <Button
              title="Testar Input em Modal"
              variant="outline"
              onPress={() => setShowInputModal(true)}
            />
          </DemoContainer>
        </Section>

        {/* Seletor de Tema */}
        <Section>
          <SectionTitle>Seletor de Tema</SectionTitle>
          <SectionDescription>
            Altere o tema da aplicação entre claro, escuro ou automático.
          </SectionDescription>
          
          <ThemeSelector 
            onThemeChange={(theme) => console.log('Tema alterado para:', theme)}
          />
        </Section>

        {/* Ações Principais */}
        <Section>
          <SectionTitle>Ações</SectionTitle>
          <SectionDescription>
            Demonstração de modais e painéis de configuração.
          </SectionDescription>
          
          <DemoContainer>
            <Button
              title="Abrir Seletor de Tema (Modal)"
              variant="primary"
              onPress={() => setShowThemeModal(true)}
              fullWidth
            />
            
            <Button
              title="Abrir Configurações Completas"
              variant="secondary"
              onPress={() => setShowSettingsModal(true)}
              fullWidth
            />
          </DemoContainer>
        </Section>
      </Content>

      {/* Modal do Seletor de Tema */}
      <Modal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="Selecionar Tema"
        size="md"
      >
        <ThemeSelector 
          onThemeChange={(theme) => {
            console.log('Tema alterado para:', theme);
            setShowThemeModal(false);
          }}
        />
      </Modal>

      {/* Modal de Configurações */}
      <SettingsPanel
        modal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />

      {/* Modal de Input */}
      <Modal
        visible={showInputModal}
        onClose={() => setShowInputModal(false)}
        title="Teste de Input"
        primaryAction={{
          title: 'Enviar',
          onPress: handleInputSubmit
        }}
        secondaryAction={{
          title: 'Cancelar',
          onPress: () => {
            setShowInputModal(false);
            setInputValue('');
            setInputError('');
          }
        }}
      >
        <View style={{ padding: 16 }}>
          <Input
            label="Digite uma mensagem"
            placeholder="Mínimo 3 caracteres..."
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              if (inputError) setInputError('');
            }}
            error={inputError}
            required
            autoFocus
          />
        </View>
      </Modal>
    </Container>
  );
};

export default SettingsScreen;