import React, { ReactNode, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Slider,
  Table,
  Tabs,
  Typography,
} from 'antd';
import {
  runComputation,
  computeExcentricity,
  computeEllipsisArea,
  computePartialEllipsisArea,
  computePeriod,
} from './lib/compute';
import { ColumnsType } from 'antd/lib/table';

// Custom component that combines Slider and InputNumber
interface SliderWithInputProps {
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Component to display iteration results in a table
interface IterationResult {
  iteracia: number;
  a: number;
  d: number;
  MAG1: number;
  MAG2: number;
  L1: number;
  L2: number;
  M1: number;
  M2: number;
  diff: number;
}

const IterationResultsTable: React.FC<{ data: IterationResult[] }> = ({ data }) => {
  const columns: ColumnsType<IterationResult> = [
    {
      title: 'Iteration',
      dataIndex: 'iteracia',
      key: 'iteracia',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Large Semi-axis (a)',
      dataIndex: 'a',
      key: 'a',
      width: 150,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'Distance (d)',
      dataIndex: 'd',
      key: 'd',
      width: 120,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'MAG1',
      dataIndex: 'MAG1',
      key: 'MAG1',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'MAG2',
      dataIndex: 'MAG2',
      key: 'MAG2',
      width: 100,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'L1',
      dataIndex: 'L1',
      key: 'L1',
      width: 120,
      render: (value: number) => value.toExponential(2),
    },
    {
      title: 'L2',
      dataIndex: 'L2',
      key: 'L2',
      width: 120,
      render: (value: number) => value.toExponential(2),
    },
    {
      title: 'M1',
      dataIndex: 'M1',
      key: 'M1',
      width: 100,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'M2',
      dataIndex: 'M2',
      key: 'M2',
      width: 100,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'Diff (%)',
      dataIndex: 'diff',
      key: 'diff',
      width: 100,
      render: (value: number) => value.toFixed(4),
    },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        size="small"
        columns={columns}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        scroll={{ x: 'max-content', y: 250 }}
        bordered
      />
    </div>
  );
};

interface FormValues {
  m1: number;
  m2: number;
  A: number;
  B: number;
  t: number;
  wantedAccuracy: number;
}

const App: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [computedValues, setComputedValues] = useState<{
    h: number;
    S: number;
    eps: number;
    T: number;
  } | null>(null);
  const [iterationResults, setIterationResults] = useState<any[]>([]);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  // Track A and B values for cross-referencing
  const [aValue, setAValue] = useState<number>(0);
  const [bValue, setBValue] = useState<number>(0);

  // Default values
  const defaultValues: FormValues = {
    m1: 3.9,
    m2: 5.3,
    A: 4.5,
    B: 3.4,
    t: 11,
    wantedAccuracy: 1,
  };

  // Update computed values when form values change
  const updateComputedValues = (values: FormValues) => {
    const { A, B, t } = values;
    const h = computeExcentricity(A, B);
    const S = computeEllipsisArea(A, B);
    const eps = computePartialEllipsisArea(A, B, h);
    const T = computePeriod(t, S, eps);

    setComputedValues({ h, S, eps, T });

    // Update A and B values for cross-referencing
    setAValue(A);
    setBValue(B);
  };

  // Handle form submission
  const onFinish = (values: FormValues) => {
    const { m1, m2, A, B, t, wantedAccuracy } = values;

    // Run the computation
    const result = runComputation(m1, m2, A, B, t, wantedAccuracy);

    // Update state with results
    setIterationResults(result.iterationResults);
    setFinalResult(result.finalResult);
    setMessage(result.message || '');
  };

  // Initialize form with default values and compute initial values
  React.useEffect(() => {
    form.setFieldsValue(defaultValues);
    updateComputedValues(defaultValues);

    // Initialize A and B values
    setAValue(defaultValues.A);
    setBValue(defaultValues.B);
  }, []);

  // Define columns for the final results table
  const finalResultColumns = [
    {
      title: 'Final results',
      dataIndex: 'parameter',
      key: 'parameter',
      width: 200,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 200,
    },
  ];

  // Prepare data for the final results table
  const finalResultData = finalResult
    ? [
        { key: '1', parameter: 'Period (T)', value: `${finalResult.T.toFixed(3)} yr` },
        { key: '2', parameter: 'Distance (d)', value: `${finalResult.d.toFixed(3)} pc` },
        { key: '3', parameter: 'STAR 1: Abs. Magnitude', value: `${finalResult.MAG1.toFixed(2)}` },
        { key: '4', parameter: 'STAR 1: Weight', value: `${finalResult.M1.toFixed(3)} suns` },
        { key: '5', parameter: 'STAR 2: Abs. Magnitude', value: `${finalResult.MAG2.toFixed(2)}` },
        { key: '6', parameter: 'STAR 2: Weight', value: `${finalResult.M2.toFixed(3)} suns` },
      ]
    : [];

  return (
    <div style={{ padding: '16px' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
        Dynamic Parallax Calculator
      </Title>

      <Row gutter={[16, 16]}>
        {/* Left Column - Input Parameters and Computed Values */}
        <Col xs={24} sm={24} md={12} lg={12} xl={8}>
          <Card title="Input Parameters" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="horizontal"
              onFinish={onFinish}
              onValuesChange={(_, allValues) => updateComputedValues(allValues as FormValues)}
              style={{ width: '100%' }}
              labelCol={{ xs: { span: 12 }, lg: { span: 24 }, xl: { span: 8 } }}
              wrapperCol={{ xs: { span: 12 }, lg: { span: 24 }, xl: { span: 16 } }}
            >
              <Form.Item
                label="Relative Magnitude 1 (m1)"
                name="m1"
                rules={[{ required: true, message: 'Please input m1!' }]}
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput min={-30} max={10} step={0.1} />
              </Form.Item>

              <Form.Item
                label="Relative Magnitude 2 (m2)"
                name="m2"
                rules={[{ required: true, message: 'Please input m2!' }]}
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput min={-30} max={10} step={0.1} />
              </Form.Item>

              <Form.Item
                label='Large Semi-axis (A) ["]'
                name="A"
                rules={[{ required: true, message: 'Please input A!' }]}
                validateStatus={aValue < bValue ? 'error' : undefined}
                help={
                  aValue < bValue
                    ? 'Large semi-axis should be larger than small semi-axis'
                    : undefined
                }
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  marks={{
                    0.1: '0.1',
                    [bValue]: {
                      label: `B=${bValue.toFixed(1)}`,
                      style: { color: aValue < bValue ? 'red' : 'blue' },
                    },
                    10: '10',
                  }}
                />
              </Form.Item>

              <Form.Item
                label='Small Semi-axis (B) ["]'
                name="B"
                rules={[{ required: true, message: 'Please input B!' }]}
                validateStatus={bValue > aValue ? 'error' : undefined}
                help={
                  bValue > aValue
                    ? 'Small semi-axis should be smaller than large semi-axis'
                    : undefined
                }
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  marks={{
                    0.1: '0.1',
                    [aValue]: {
                      label: `A=${aValue.toFixed(1)}`,
                      style: { color: bValue > aValue ? 'red' : 'blue' },
                    },
                    10: '10',
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Observation Length (t) [yr]"
                name="t"
                rules={[{ required: true, message: 'Please input t!' }]}
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput min={1} max={20} step={1} />
              </Form.Item>

              <Form.Item
                label="Wanted Accuracy [%] "
                name="wantedAccuracy"
                rules={[{ required: true, message: 'Please input wanted accuracy!' }]}
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput
                  min={0.1}
                  max={5}
                  step={0.1}
                  formatter={value => `${value}%`}
                  marks={{ 0.1: '0.1%', 5: '5%' }}
                />
              </Form.Item>

              {/* Computed Values Section */}
              {computedValues && (
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <Title level={5}>Computed Values</Title>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Excentricity (h):</Text> {computedValues.h.toFixed(2)}"
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Ellipsis Area (S):</Text> {computedValues.S.toFixed(2)}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Partial Ellipsis Area (eps):</Text> {computedValues.eps.toFixed(2)}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Period (T):</Text> {computedValues.T.toFixed(2)} yr
                  </div>
                </div>
              )}

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Compute
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Results */}
        <Col xs={24} sm={24} md={12} lg={12} xl={16}>
          {iterationResults.length > 0 && (
            <Card
              title="Iteration Results"
              style={{ marginBottom: '8px', paddingBottom: 0 }}
              bodyStyle={{ padding: 16 }}
            >
              <Tabs defaultActiveKey="table" type="card">
                <TabPane tab="Table" key="table">
                  <IterationResultsTable data={iterationResults} />
                </TabPane>
                <TabPane tab="JSON" key="json">
                  <pre style={{ maxHeight: '250px', overflow: 'auto', margin: 0, marginBottom: 8 }}>
                    {JSON.stringify(iterationResults, null, 2)}
                  </pre>
                </TabPane>
              </Tabs>
              {message && <Paragraph strong>{message}</Paragraph>}
            </Card>
          )}

          {finalResult && (
            <div style={{ overflowX: 'auto' }}>
              <Table
                size="small"
                columns={finalResultColumns}
                dataSource={finalResultData}
                pagination={false}
                scroll={{ x: 'max-content' }}
                bordered
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default App;
