// components/Typography.tsx
import React from 'react'
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native'
import { Typography, Colors } from '../constants/Theme'

// Extender las props de Text de React Native
export interface TextProps extends RNTextProps {
  style?: TextStyle | TextStyle[]
  color?: string
  children: React.ReactNode
}

// Componente base de texto
const Text: React.FC<TextProps> = ({ style, children, color, ...props }) => {
  return (
    <RNText 
      style={[
        { color: color || Colors.text },
        style
      ]} 
      {...props}
    >
      {children}
    </RNText>
  )
}

// Componentes específicos para cada tipo de texto
export const H1: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.h1, style]} {...props} />
)

export const H2: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.h2, style]} {...props} />
)

export const H3: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.h3, style]} {...props} />
)

export const H4: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.h4, style]} {...props} />
)

export const Body: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.body, style]} {...props} />
)

export const BodySmall: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.bodySmall, style]} {...props} />
)

export const Caption: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.caption, style]} {...props} />
)

export const ButtonText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[Typography.styles.button, style]} {...props} />
)

export default Text

// Ejemplo de uso:
/*
import Text, { H1, H2, Body, Caption } from '../components/Typography'

<H1>Título Principal</H1>
<H2 color={Colors.primary}>Subtítulo</H2>
<Body>Este es el contenido principal del texto.</Body>
<Caption color={Colors.textMuted}>Texto de caption</Caption>
*/