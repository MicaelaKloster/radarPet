import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ThemeSelector() {
  const { theme, setTheme, isDark, colors } = useTheme();

  const options = [
    { value: 'light' as const, label: 'Claro', icon: 'sun.max.fill' },
    { value: 'dark' as const, label: 'Oscuro', icon: 'moon.fill' },
    { value: 'system' as const, label: 'Sistema', icon: 'gear' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Apariencia
      </Text>
      <Text style={[styles.subtitle, { color: colors.secondary }]}>
        Selecciona el tema de la aplicación
      </Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: colors.card,
                borderColor: theme === option.value ? colors.primary : colors.border,
                borderWidth: theme === option.value ? 2 : 1,
              },
            ]}
            onPress={() => setTheme(option.value)}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      theme === option.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <IconSymbol
                  name={option.icon}
                  size={24}
                  color={theme === option.value ? '#FFFFFF' : colors.secondary}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: theme === option.value ? colors.primary : colors.text,
                    fontWeight: theme === option.value ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
            </View>
            {theme === option.value && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <IconSymbol name="info.circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.secondary }]}>
          {theme === 'system'
            ? 'La app cambiará automáticamente según la configuración de tu dispositivo'
            : `Has seleccionado el tema ${theme === 'dark' ? 'oscuro' : 'claro'}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});