import React from 'react'
import { ViewStyle, TextStyle } from 'react-native'
import { 
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial
} from '@expo/vector-icons'
import { Colors } from '../constants/Theme'

// Tipos de conjuntos de iconos disponibles
export type IconSet = 
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Fontisto'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial'

// Props para el componente Icon
export interface IconProps {
  set?: IconSet
  name: string
  size?: number
  color?: string
  style?: ViewStyle | TextStyle
  [key: string]: any
}

// Props para iconos predefinidos
export interface AppIconProps {
  size?: number
  color?: string
  style?: ViewStyle | TextStyle
  [key: string]: any
}

const iconSets = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
}

const Icon: React.FC<IconProps> = ({ 
  set = 'MaterialIcons', 
  name, 
  size = 24, 
  color = Colors.text,
  style,
  ...props 
}) => {
  const IconComponent = iconSets[set]
  
  if (!IconComponent) {
    console.warn(`Icon set "${set}" no encontrado. Usando MaterialIcons por defecto.`)
    return <MaterialIcons name={name} size={size} color={color} style={style} {...props} />
  }

  return <IconComponent name={name} size={size} color={color} style={style} {...props} />
}

// Iconos predefinidos más comunes para tu app
export const AppIcons = {
  // Navegación
  home: (props: AppIconProps) => <Icon set="Ionicons" name="home" {...props} />,
  search: (props: AppIconProps) => <Icon set="Ionicons" name="search" {...props} />,
  profile: (props: AppIconProps) => <Icon set="Ionicons" name="person" {...props} />,
  settings: (props: AppIconProps) => <Icon set="Ionicons" name="settings" {...props} />,
  menu: (props: AppIconProps) => <Icon set="Ionicons" name="menu" {...props} />,
  back: (props: AppIconProps) => <Icon set="Ionicons" name="arrow-back" {...props} />,
  close: (props: AppIconProps) => <Icon set="Ionicons" name="close" {...props} />,
  
  // Acciones
  add: (props: AppIconProps) => <Icon set="Ionicons" name="add" {...props} />,
  edit: (props: AppIconProps) => <Icon set="Ionicons" name="pencil" {...props} />,
  delete: (props: AppIconProps) => <Icon set="Ionicons" name="trash" {...props} />,
  save: (props: AppIconProps) => <Icon set="Ionicons" name="save" {...props} />,
  share: (props: AppIconProps) => <Icon set="Ionicons" name="share" {...props} />,
  download: (props: AppIconProps) => <Icon set="Ionicons" name="download" {...props} />,
  upload: (props: AppIconProps) => <Icon set="Ionicons" name="cloud-upload" {...props} />,
  
  // Estados
  heart: (props: AppIconProps) => <Icon set="Ionicons" name="heart" {...props} />,
  heartOutline: (props: AppIconProps) => <Icon set="Ionicons" name="heart-outline" {...props} />,
  star: (props: AppIconProps) => <Icon set="Ionicons" name="star" {...props} />,
  starOutline: (props: AppIconProps) => <Icon set="Ionicons" name="star-outline" {...props} />,
  
  // Comunicación
  email: (props: AppIconProps) => <Icon set="Ionicons" name="mail" {...props} />,
  phone: (props: AppIconProps) => <Icon set="Ionicons" name="call" {...props} />,
  message: (props: AppIconProps) => <Icon set="Ionicons" name="chatbubble" {...props} />,
  
  // Multimedia
  camera: (props: AppIconProps) => <Icon set="Ionicons" name="camera" {...props} />,
  image: (props: AppIconProps) => <Icon set="Ionicons" name="image" {...props} />,
  play: (props: AppIconProps) => <Icon set="Ionicons" name="play" {...props} />,
  pause: (props: AppIconProps) => <Icon set="Ionicons" name="pause" {...props} />,
  
  // Utilidades
  calendar: (props: AppIconProps) => <Icon set="Ionicons" name="calendar" {...props} />,
  clock: (props: AppIconProps) => <Icon set="Ionicons" name="time" {...props} />,
  location: (props: AppIconProps) => <Icon set="Ionicons" name="location" {...props} />,
  notification: (props: AppIconProps) => <Icon set="Ionicons" name="notifications" {...props} />,
  
  // Estados de información
  success: (props: AppIconProps) => <Icon set="Ionicons" name="checkmark-circle" color={Colors.success} {...props} />,
  warning: (props: AppIconProps) => <Icon set="Ionicons" name="warning" color={Colors.warning} {...props} />,
  error: (props: AppIconProps) => <Icon set="Ionicons" name="close-circle" color={Colors.error} {...props} />,
  info: (props: AppIconProps) => <Icon set="Ionicons" name="information-circle" color={Colors.info} {...props} />,
}

export default Icon

// Ejemplo de uso:
/*
import Icon, { AppIcons } from '../components/Icon'

// Uso básico
<Icon set="Ionicons" name="home" size={24} color="#007AFF" />

// Usando iconos predefinidos
<AppIcons.home size={24} color="#007AFF" />
<AppIcons.search size={20} />
<AppIcons.success size={30} />
*/