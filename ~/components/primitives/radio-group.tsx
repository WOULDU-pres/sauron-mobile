import * as React from 'react';
import { View, Pressable, ViewStyle, PressableProps } from 'react-native';
import { cn } from '@/~/lib/utils';

// RadioGroup Context for managing state
const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

// RadioGroup Component
interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  accessibilityLabel?: string;
}

function RadioGroup({
  value,
  onValueChange,
  className,
  style,
  children,
  accessibilityLabel,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View 
        className={cn('web:grid gap-2', className)}
        style={style}
        accessibilityLabel={accessibilityLabel}
        role="radiogroup"
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

// RadioGroupItem Component
interface RadioGroupItemProps extends Omit<PressableProps, 'onPress'> {
  value: string;
  className?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

function RadioGroupItem({
  value,
  className,
  style,
  accessibilityLabel,
  disabled,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }
  
  const { value: groupValue, onValueChange } = context;
  const isSelected = groupValue === value;
  
  const handlePress = React.useCallback(() => {
    if (!disabled && onValueChange) {
      onValueChange(value);
    }
  }, [value, onValueChange, disabled]);
  
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityLabel}
      {...props}
      style={[
        {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#0f172a', // primary color
          backgroundColor: isSelected ? '#0f172a' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {isSelected && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#ffffff', // background color for selected dot
          }}
        />
      )}
    </Pressable>
  );
}

export { RadioGroup, RadioGroupItem }; 