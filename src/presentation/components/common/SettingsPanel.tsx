/**
 * Componente SettingsPanel
 * 
 * Painel de configurações da aplicação que inclui:
 * - Seletor de tema (claro/escuro/automático)
 * - Configurações de acessibilidade
 * - Preferências do usuário
 * 
 * Suporta tanto modo modal quanto inline
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../../providers/ThemeProvider';
import { ThemeSelector } from './ThemeSelector';
import { Button } from './Button';
import { Modal } from './Modal';

interface SettingsPanelProps {
  /** Se deve exibir como modal @default false */
  modal?: boolean;
  /** Se o modal está visível (apenas quando modal=true) */
  visible?: boolean;
  /** Função chamada para fechar o modal */
  onClose?: () => void;
  /** Função chamada quando configurações são salvas */
  onSave?: (settings: UserSettings) => void;
  /** ID para testes automatizados */
  testID?: string;
}

interface UserSettings {
  /** Modo de tema selecionado */
  themeMode: 'light' | 'dark' | 'auto';
  /** Se animações estão habilitadas */
  animationsEnabled: boolean;
  /** Se feedback háptico está habilitado */
  hapticFeedbackEnabled: boolean;
  /** Se modo de alto contraste está habilitado */
  highContrastMode: boolean;
  /** Tamanho da fonte (escala) */
  fontScale: number;
}

const Container = styled(View)<{ theme: DefaultTheme }>`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const ScrollContainer = styled(ScrollView)<{ theme: DefaultTheme }>`
  flex: 1;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const Section = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.lg}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  ${({ theme }: { theme: DefaultTheme }) => `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 2;
  `}
`;

const SectionTitle = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const SettingItem = styled(View)<{ theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

const SettingItemLast = styled(SettingItem)`
  border-bottom-width: 0;
`;

const SettingContent = styled(View)<{ theme: DefaultTheme }>`
  flex: 1;
  margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const SettingLabel = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: 2px;
`;

const SettingDescription = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.subtext};
  line-height: ${({ theme }: { theme: DefaultTheme }) => theme.typography.lineHeights.sm}px;
`;

const FontScaleContainer = styled(View)<{ theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const FontScaleButton = styled(Button)<{ theme: DefaultTheme }>`
  min-width: 40px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(1)}px;
`;

const FontScaleValue = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  min-width: 60px;
  text-align: center;
`;

const ActionButtons = styled(View)<{ theme: DefaultTheme }>`
  flex-direction: row;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border-top-width: 1px;
  border-top-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

/**
 * Componente SettingsPanel
 * 
 * @example Uso inline
 * ```tsx
 * <SettingsPanel onSave={(settings) => console.log('Configurações salvas:', settings)} />
 * ```
 * 
 * @example Como modal
 * ```tsx
 * <SettingsPanel 
 *   modal 
 *   visible={showSettings} 
 *   onClose={() => setShowSettings(false)}
 *   onSave={handleSaveSettings} 
 * />
 * ```
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(({
  modal = false,
  visible = false,
  onClose,
  onSave,
  testID
}) => {
  const { themeMode, isDark } = useThemeContext();
  
  const [settings, setSettings] = useState<UserSettings>({
    themeMode: themeMode,
    animationsEnabled: true,
    hapticFeedbackEnabled: true,
    highContrastMode: false,
    fontScale: 1.0
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(settings);
    setHasChanges(false);
    if (modal) {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (modal) {
      onClose?.();
    }
    setHasChanges(false);
  };

  const adjustFontScale = (delta: number) => {
    const newScale = Math.max(0.8, Math.min(1.5, settings.fontScale + delta));
    updateSetting('fontScale', Math.round(newScale * 10) / 10);
  };

  const renderContent = () => (
    <Container>
      <ScrollContainer 
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {/* Seção de Aparência */}
        <Section>
          <SectionTitle>Aparência</SectionTitle>
          <ThemeSelector 
            onThemeChange={(theme) => updateSetting('themeMode', theme)}
            testID={`${testID}-theme-selector`}
          />
        </Section>

        {/* Seção de Acessibilidade */}
        <Section>
          <SectionTitle>Acessibilidade</SectionTitle>
          
          <SettingItem>
            <SettingContent>
              <SettingLabel>Alto Contraste</SettingLabel>
              <SettingDescription>
                Aumenta o contraste para melhor visibilidade
              </SettingDescription>
            </SettingContent>
            <Switch
              value={settings.highContrastMode}
              onValueChange={(value) => updateSetting('highContrastMode', value)}
              testID={`${testID}-high-contrast-switch`}
              accessibilityLabel="Alternar modo de alto contraste"
            />
          </SettingItem>

          <SettingItemLast>
            <SettingContent>
              <SettingLabel>Tamanho da Fonte</SettingLabel>
              <SettingDescription>
                Ajuste o tamanho do texto na aplicação
              </SettingDescription>
            </SettingContent>
            <FontScaleContainer>
              <FontScaleButton
                title="-"
                size="sm"
                variant="outline"
                onPress={() => adjustFontScale(-0.1)}
                disabled={settings.fontScale <= 0.8}
                testID={`${testID}-font-scale-decrease`}
                accessibilityLabel="Diminuir tamanho da fonte"
              />
              <FontScaleValue>{settings.fontScale.toFixed(1)}x</FontScaleValue>
              <FontScaleButton
                title="+"
                size="sm"
                variant="outline"
                onPress={() => adjustFontScale(0.1)}
                disabled={settings.fontScale >= 1.5}
                testID={`${testID}-font-scale-increase`}
                accessibilityLabel="Aumentar tamanho da fonte"
              />
            </FontScaleContainer>
          </SettingItemLast>
        </Section>

        {/* Seção de Experiência */}
        <Section>
          <SectionTitle>Experiência</SectionTitle>
          
          <SettingItem>
            <SettingContent>
              <SettingLabel>Animações</SettingLabel>
              <SettingDescription>
                Habilita animações e transições suaves
              </SettingDescription>
            </SettingContent>
            <Switch
              value={settings.animationsEnabled}
              onValueChange={(value) => updateSetting('animationsEnabled', value)}
              testID={`${testID}-animations-switch`}
              accessibilityLabel="Alternar animações"
            />
          </SettingItem>

          <SettingItemLast>
            <SettingContent>
              <SettingLabel>Feedback Háptico</SettingLabel>
              <SettingDescription>
                Vibração ao interagir com elementos
              </SettingDescription>
            </SettingContent>
            <Switch
              value={settings.hapticFeedbackEnabled}
              onValueChange={(value) => updateSetting('hapticFeedbackEnabled', value)}
              testID={`${testID}-haptic-switch`}
              accessibilityLabel="Alternar feedback háptico"
            />
          </SettingItemLast>
        </Section>
      </ScrollContainer>

      {!modal && (
        <ActionButtons>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            disabled={!hasChanges}
            testID={`${testID}-cancel-button`}
            style={{ flex: 1 }}
          />
          <Button
            title="Salvar"
            onPress={handleSave}
            disabled={!hasChanges}
            testID={`${testID}-save-button`}
            style={{ flex: 1 }}
          />
        </ActionButtons>
      )}
    </Container>
  );

  if (modal) {
    return (
      <Modal
        visible={visible}
        onClose={onClose || (() => {})}
        title="Configurações"
        size="lg"
        primaryAction={hasChanges ? {
          title: 'Salvar',
          onPress: handleSave
        } : undefined}
        secondaryAction={{
          title: 'Cancelar',
          onPress: handleCancel
        }}
        testID={`${testID}-modal`}
      >
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
});

SettingsPanel.displayName = 'SettingsPanel';

export type { UserSettings };