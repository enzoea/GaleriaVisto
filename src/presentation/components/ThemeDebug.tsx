import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '../providers/ThemeProvider';

export const ThemeDebug: React.FC = () => {
  const { theme, themeMode, isDark, setTheme, toggleTheme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Debug do Tema</Text>
      <Text style={[styles.info, { color: theme.colors.subtext }]}>
        Modo atual: {themeMode} | É escuro: {isDark ? 'Sim' : 'Não'}
      </Text>
      <Text style={[styles.info, { color: theme.colors.subtext }]}>
        Cor de fundo: {theme.colors.background}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setTheme('light')}
          accessibilityRole="button"
          accessibilityLabel="Definir tema claro"
          accessibilityHint="Altera o tema da aplicação para o modo claro"
        >
          <Text style={styles.buttonText}>Claro</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setTheme('dark')}
          accessibilityRole="button"
          accessibilityLabel="Definir tema escuro"
          accessibilityHint="Altera o tema da aplicação para o modo escuro"
        >
          <Text style={styles.buttonText}>Escuro</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setTheme('auto')}
          accessibilityRole="button"
          accessibilityLabel="Definir tema automático"
          accessibilityHint="Altera o tema da aplicação para seguir as configurações do sistema"
        >
          <Text style={styles.buttonText}>Auto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.success }]}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Alternar tema"
          accessibilityHint="Alterna entre os temas disponíveis"
        >
          <Text style={styles.buttonText}>Toggle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});