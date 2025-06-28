import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/~/hooks/useThemeColor';
import { createTextStyle } from '@/~/lib/utils';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return createTextStyle('2xl', 'bold', 'foreground');
      case 'defaultSemiBold':
        return createTextStyle('base', 'semibold', 'foreground');
      case 'subtitle':
        return createTextStyle('lg', 'semibold', 'foreground');
      case 'link':
        return createTextStyle('base', 'medium', 'primary');
      case 'default':
      default:
        return createTextStyle('base', 'normal', 'foreground');
    }
  };

  return (
    <Text
      style={[
        getTypeStyle(),
        { color },
        style,
      ]}
      {...rest}
    />
  );
}
