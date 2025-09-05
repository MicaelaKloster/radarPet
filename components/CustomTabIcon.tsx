import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface CustomTabIconProps {
  focused: boolean;
  iconName: 'inicio' | 'mapa' | 'patita' | 'perfil';
  size?: number;
}

const iconMap = {
  inicio: {
    active: require('@/Iconos/IconoInicio.png'),
    inactive: require('@/Iconos/IconoInicio_Gris.png'),
  },
  mapa: {
    active: require('@/Iconos/IconoMapa.png'),
    inactive: require('@/Iconos/IconoMapa_Gris.png'),
  },
  patita: {
    active: require('@/Iconos/IconoPatita.png'),
    inactive: require('@/Iconos/IconoPatita_Gris.png'),
  },
  perfil: {
    active: require('@/Iconos/IconoPerfil.png'),
    inactive: require('@/Iconos/IconoPerfil_Gris.png'),
  },
};

export function CustomTabIcon({ focused, iconName, size = 24 }: CustomTabIconProps) {
  const iconSource = focused ? iconMap[iconName].active : iconMap[iconName].inactive;

  return (
    <Image
      source={iconSource}
      style={[styles.icon, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});
