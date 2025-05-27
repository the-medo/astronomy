import React from 'react';
import { SliderWithInputProps } from '../types/SliderWithInputProps';
import SliderWithInput from './SliderWithInput';

// Make the component work with Form.Item
const FormSliderWithInput = ({
  value,
  onChange,
  formatter,
  ...props
}: SliderWithInputProps & { value?: number; onChange?: (value: number | null) => void }) => {
  // Create a custom formatter function that wraps the provided formatter
  const customFormatter = formatter
    ? (value: number | undefined) => formatter(value)
    : (value: number | undefined) => `${value}`;

  // Set useDefaultFormatter to true if no formatter is provided
  const useDefaultFormatter = formatter === undefined;

  return (
    <SliderWithInput
      {...props}
      value={value}
      onChange={onChange}
      formatter={customFormatter}
      useDefaultFormatter={useDefaultFormatter}
    />
  );
};

export default FormSliderWithInput;