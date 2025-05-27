import { ReactNode } from 'react';

export interface SliderWithInputProps {
  min: number;
  max: number;
  step: number;
  value?: number;
  onChange?: (value: number | null) => void;
  // Define formatter type to match what Slider expects
  formatter?: (value: number | undefined) => string;
  marks?: Record<number, string | { label: string; style: { color: string } }>;
  useDefaultFormatter?: boolean;
}