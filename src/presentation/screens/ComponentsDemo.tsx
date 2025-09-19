import React, { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useThemeContext } from '../providers/ThemeProvider';
import { usePhotoContext } from '../providers/PhotoProvider';

interface ThemeProps {
  theme: DefaultTheme;
}

const Container = styled(ScrollView)<ThemeProps>`
  flex: 1;
  background-color: ${({ theme }: ThemeProps) => theme.colors.background};
  padding: ${({ theme }: ThemeProps) => theme.spacing(2)}px;
`;

const Section = styled.View<ThemeProps>`
  margin-bottom: 32px;
`;

const SectionTitle = styled(Text)<ThemeProps>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }: ThemeProps) => theme.colors.text};
  margin-bottom: ${({ theme }: ThemeProps) => theme.spacing(2)}px;
  margin-top: ${({ theme }: ThemeProps) => theme.spacing(3)}px;
`;

const ComponentGroup = styled.View<ThemeProps>`
  gap: 12px;
`;

const Row = styled.View<ThemeProps>`
  flex-direction: row;
  gap: 12px;
  flex-wrap: wrap;
`;

const DemoCard = styled(View)<ThemeProps>`
  background-color: ${({ theme }: ThemeProps) => theme.colors.card};
  border: 1px solid ${({ theme }: ThemeProps) => theme.colors.border};
  border-radius: ${({ theme }: ThemeProps) => theme.radius.md}px;
  padding: ${({ theme }: ThemeProps) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }: ThemeProps) => theme.spacing(2)}px;
`;

const DemoTitle = styled(Text)<ThemeProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }: ThemeProps) => theme.colors.text};
  margin-bottom: ${({ theme }: ThemeProps) => theme.spacing(1)}px;
`;

const StateText = styled(Text)<ThemeProps>`
  font-size: 14px;
  color: ${({ theme }: ThemeProps) => theme.colors.subtext};
  margin-top: ${({ theme }: ThemeProps) => theme.spacing(1)}px;
`;

export default function ComponentsDemo() {
  const { theme, toggleTheme } = useThemeContext();
  const { state } = usePhotoContext();
  
  // Estados para demonstração
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonPress = (variant: string) => {
    Alert.alert('Button Pressed', `Você pressionou o botão ${variant}`);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.length < 3 && text.length > 0) {
      setInputError('Mínimo 3 caracteres');
    } else {
      setInputError('');
    }
  };

  const handleModalAction = async () => {
    setIsLoading(true);
    // Simula uma operação async
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsModalVisible(false);
    Alert.alert('Sucesso', 'Operação concluída!');
  };

  return (
    <Container theme={theme}>
      {/* Seção de Botões */}
      <Section>
        <SectionTitle theme={theme}>Botões</SectionTitle>
        
        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Variantes</DemoTitle>
          <ComponentGroup>
            <Button
              title="Primary"
              onPress={() => handleButtonPress('primary')}
              variant="primary"
            />
            <Button
              title="Secondary"
              onPress={() => handleButtonPress('secondary')}
              variant="secondary"
            />
            <Button
              title="Outline"
              onPress={() => handleButtonPress('outline')}
              variant="outline"
            />
            <Button
              title="Ghost"
              onPress={() => handleButtonPress('ghost')}
              variant="ghost"
            />
            <Button
              title="Danger"
              onPress={() => handleButtonPress('danger')}
              variant="danger"
            />
          </ComponentGroup>
        </DemoCard>

        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Tamanhos</DemoTitle>
          <ComponentGroup>
            <Button
              title="Small"
              onPress={() => handleButtonPress('small')}
              size="sm"
            />
            <Button
              title="Medium"
              onPress={() => handleButtonPress('medium')}
              size="md"
            />
            <Button
              title="Large"
              onPress={() => handleButtonPress('large')}
              size="lg"
            />
          </ComponentGroup>
        </DemoCard>

        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Estados e Ícones</DemoTitle>
          <ComponentGroup>
            <Button
              title="Com Ícone"
              onPress={() => handleButtonPress('icon')}
              icon={<Ionicons name="camera" size={16} color="white" />}
            />
            <Button
              title="Carregando"
              onPress={() => {}}
              loading={true}
            />
            <Button
              title="Desabilitado"
              onPress={() => {}}
              disabled={true}
            />
            <Button
              title="Largura Total"
              onPress={() => handleButtonPress('full-width')}
              fullWidth={true}
            />
          </ComponentGroup>
        </DemoCard>
      </Section>

      {/* Seção de Inputs */}
      <Section>
        <SectionTitle theme={theme}>Inputs</SectionTitle>
        
        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Variantes</DemoTitle>
          <ComponentGroup>
            <Input
              label="Input Padrão"
              placeholder="Digite algo..."
              value={inputValue}
              onChangeText={handleInputChange}
              error={inputError}
              hint="Mínimo 3 caracteres"
            />
            <Input
              label="Input Preenchido"
              placeholder="Input filled..."
              variant="filled"
            />
            <Input
              label="Input Outline"
              placeholder="Input outline..."
              variant="outline"
            />
          </ComponentGroup>
        </DemoCard>

        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Com Ícones</DemoTitle>
          <ComponentGroup>
            <Input
              label="Buscar"
              placeholder="Buscar fotos..."
              leftIcon={<Ionicons name="search" size={20} color={theme.colors.textSecondary} />}
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              secureTextEntry
              rightIcon={<Ionicons name="eye" size={20} color={theme.colors.textSecondary} />}
            />
          </ComponentGroup>
        </DemoCard>

        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Tamanhos e Estados</DemoTitle>
          <ComponentGroup>
            <Input
              label="Small"
              placeholder="Input pequeno"
              size="sm"
            />
            <Input
              label="Large"
              placeholder="Input grande"
              size="lg"
            />
            <Input
              label="Campo Obrigatório"
              placeholder="Campo obrigatório"
              required
            />
          </ComponentGroup>
        </DemoCard>
      </Section>

      {/* Seção de Modal */}
      <Section>
        <SectionTitle theme={theme}>Modal</SectionTitle>
        
        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>Demonstração</DemoTitle>
          <ComponentGroup>
            <Button
              title="Abrir Modal"
              onPress={() => setIsModalVisible(true)}
              icon={<Ionicons name="open" size={16} color="white" />}
            />
          </ComponentGroup>
        </DemoCard>
      </Section>

      {/* Seção de Estado Global */}
      <Section>
        <SectionTitle theme={theme}>Estado Global</SectionTitle>
        
        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>PhotoProvider</DemoTitle>
          <StateText theme={theme}>
            Total de fotos: {state.photos.length}
          </StateText>
          <StateText theme={theme}>
            Carregando: {state.loading ? 'Sim' : 'Não'}
          </StateText>
          <StateText theme={theme}>
            Erro: {state.error || 'Nenhum'}
          </StateText>
        </DemoCard>

        <DemoCard theme={theme}>
          <DemoTitle theme={theme}>ThemeProvider</DemoTitle>
          <Button
            title="Alternar Tema"
            onPress={toggleTheme}
            icon={<Ionicons name="color-palette" size={16} color="white" />}
          />
          <StateText theme={theme}>
            Tema atual: {theme === theme ? 'Configurado' : 'Erro'}
          </StateText>
        </DemoCard>
      </Section>

      {/* Modal de Demonstração */}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Modal de Demonstração"
        primaryAction={{
          title: 'Confirmar',
          onPress: handleModalAction,
          loading: isLoading,
        }}
        secondaryAction={{
          title: 'Cancelar',
          onPress: () => setIsModalVisible(false),
          disabled: isLoading,
        }}
      >
        <View>
          <Text style={{ color: theme.colors.text, marginBottom: 16 }}>
            Este é um exemplo de modal com ações primárias e secundárias.
          </Text>
          <Input
            label="Campo no Modal"
            placeholder="Digite algo..."
          />
        </View>
      </Modal>
    </Container>
  );
}