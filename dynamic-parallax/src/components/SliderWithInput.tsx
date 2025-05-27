import React from 'react';
import { Col, InputNumber, Row, Slider } from 'antd';
import { SliderWithInputProps } from '../types/SliderWithInputProps';

const SliderWithInput: React.FC<SliderWithInputProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  formatter = value => `${value}`,
  marks,
  useDefaultFormatter = true,
}) => {
  return (
    <Row gutter={[8, 8]}>
      <Col xs={16} sm={18} md={18}>
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          tooltip={{ formatter }}
          marks={marks || { [min]: formatter(min), [max]: formatter(max) }}
        />
      </Col>
      <Col xs={8} sm={6} md={6}>
        <InputNumber
          style={{ width: '100%' }}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          formatter={
            useDefaultFormatter
              ? undefined
              : value => {
                  // Safe conversion to number and formatting
                  const numValue = typeof value === 'number' ? value : Number(value || 0);
                  return formatter(numValue);
                }
          }
          parser={
            useDefaultFormatter
              ? undefined
              : value => {
                  // Safe parsing to number
                  return parseFloat(value?.toString().replace(/[^\d.]/g, '') || '0');
                }
          }
        />
      </Col>
    </Row>
  );
};

export default SliderWithInput;