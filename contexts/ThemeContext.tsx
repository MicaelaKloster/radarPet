import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    text: string;
    card: string;
    border: string;
    primary: string;
    secondary: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@radarPet:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme(); // Detecta el tema del sistema
  const [theme, setThemeState] = useState<Theme>('system');
  
  // Determinar si debe usar modo oscuro
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark' 
    : theme === 'dark';

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    if (theme === 'system') {
      // Si el usuario tiene configurado 'system', reaccionar a cambios
      console.log(`Tema del sistema cambió a: ${systemColorScheme}`);
    }
  }, [systemColorScheme, theme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error cargando preferencia de tema:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error guardando preferencia de tema:', error);
    }
  };

  // Colores según el tema
  const colors = isDark
    ? {
        // Modo Oscuro
        background: '#111827',
        text: '#F9FAFB',
        card: '#1F2937',
        border: '#374151',
        primary: '#2CBDAA',
        secondary: '#6B7280',
      }
    : {
        // Modo Claro
        background: '#FFFFFF',
        text: '#111827',
        card: '#F9FAFB',
        border: '#E5E7EB',
        primary: '#2CBDAA',
        secondary: '#6B7280',
      };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}