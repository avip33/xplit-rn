// components/Icon.tsx
import ArrowLeft from '@/assets/icons/arrow-left.svg';
import ArrowRight from '@/assets/icons/arrow-right.svg';
import Checkmark from '@/assets/icons/checkmark.svg';
import EyeOff from '@/assets/icons/eye-off.svg';
import Eye from '@/assets/icons/eye.svg';
import Mail from '@/assets/icons/mail.svg';
import { useThemeColor } from '@/hooks/useThemeColor'; // <-- same hook you used elsewhere
import React from 'react';

const MAP = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  checkmark: Checkmark,
  eye: Eye,
  eyeOff: EyeOff,
  mail: Mail,
} as const;

export type IconName = keyof typeof MAP;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string; // explicit override
} & React.ComponentProps<typeof ArrowRight>;

export function Icon({ name, size = 24, color, ...rest }: IconProps) {
  // Pull the current theme's text color
  const themeText = useThemeColor({}, 'icon') as string;

  // Use explicit color if provided; otherwise theme text
  const resolvedColor = color ?? themeText;

  const Cmp = MAP[name];
  return (
    <Cmp
      width={size}
      height={size}
      // Support both fill- and stroke-based SVGs
      color={resolvedColor}
      fill={resolvedColor}
      stroke={resolvedColor}
      {...rest}
    />
  );
}
