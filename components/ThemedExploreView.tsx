import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedExploreViewProps = ViewProps;

export function ThemedExploreView({ style, ...otherProps }: ThemedExploreViewProps) {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? '#000' : '#fff';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
