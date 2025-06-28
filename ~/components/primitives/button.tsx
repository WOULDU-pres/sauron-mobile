/**
 * shadcn 대응 React Native Button 컴포넌트
 * @rn-primitives 기반으로 디자인 토큰과 유틸리티 연동
 */

import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/~/lib/utils';
import { TextClassContext } from '~/components/primitives/text';

const buttonVariants = cva(
  'web:group web:inline-flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 web:disabled:pointer-events-none web:disabled:opacity-50 active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary web:hover:opacity-90 active:opacity-90',
        destructive: 'bg-destructive web:hover:opacity-90 active:opacity-90',
        outline:
          'border border-input bg-background web:hover:bg-accent active:bg-accent web:hover:text-accent-foreground active:text-accent-foreground',
        secondary: 'bg-secondary web:hover:opacity-90 active:opacity-90',
        ghost: 'web:hover:bg-accent active:bg-accent web:hover:text-accent-foreground active:text-accent-foreground',
        link: 'web:hover:underline active:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 native:h-12 native:px-5 native:py-3',
        sm: 'h-9 rounded-md px-3 native:h-10 native:px-4',
        lg: 'h-11 rounded-md px-8 native:h-12 native:px-6',
        icon: 'h-10 w-10 native:h-12 native:w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'text-sm native:text-base font-medium web:transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'text-foreground web:group-hover:text-accent-foreground web:group-active:text-accent-foreground',
        secondary: 'text-secondary-foreground',
        ghost: 'text-foreground web:group-hover:text-accent-foreground web:group-active:text-accent-foreground',
        link: 'text-primary web:group-hover:underline web:group-active:underline',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = PressableProps & {
  asChild?: boolean;
  title?: string; // Legacy support
  loading?: boolean; // Legacy support
} & VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant,
  size,
  asChild = false,
  title, // Legacy prop
  loading = false, // Legacy prop
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Pressable : Pressable;

  // Handle legacy title prop and loading state
  const buttonContent = title ? (
    <Text className={cn(buttonTextVariants({ variant, size }))}>
      {loading ? "로딩 중..." : title}
    </Text>
  ) : children;

  return (
    <TextClassContext.Provider
      value={buttonTextVariants({ variant, size, className })}
    >
      <Component
        className={cn(
          buttonVariants({ variant, size }),
          (disabled || loading) && 'opacity-50',
          className
        )}
        role="button"
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </Component>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
