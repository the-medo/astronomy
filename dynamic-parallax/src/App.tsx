import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Table, Typography } from 'antd';
import { runComputation, computeExcentricity, computeEllipsisArea, computePartialEllipsisArea, computePeriod } from './lib/compute';

const { Title, Text, Paragraph } = Typography;

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
  }, []);

  // Define columns for the final results table
  const finalResultColumns = [
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
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
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dynamic Parallax Calculator</Title>

      <Row gutter={24}>
        {/* Left Column - Input Parameters and Computed Values */}
        <Col span={8}>
          <Card title="Input Parameters" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={(_, allValues) => updateComputedValues(allValues as FormValues)}
              style={{ width: '300px' }}
            >
              <Form.Item
                label="Relative Magnitude 1 (m1)"
                name="m1"
                rules={[{ required: true, message: 'Please input m1!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} />
              </Form.Item>

              <Form.Item
                label="Relative Magnitude 2 (m2)"
                name="m2"
                rules={[{ required: true, message: 'Please input m2!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} />
              </Form.Item>

              <Form.Item
                label="Large Semi-axis (A) in arc seconds"
                name="A"
                rules={[{ required: true, message: 'Please input A!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} />
              </Form.Item>

              <Form.Item
                label="Small Semi-axis (B) in arc seconds"
                name="B"
                rules={[{ required: true, message: 'Please input B!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} />
              </Form.Item>

              <Form.Item
                label="Observation Length (t) in years"
                name="t"
                rules={[{ required: true, message: 'Please input t!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={1} />
              </Form.Item>

              <Form.Item
                label="Wanted Accuracy (%) "
                name="wantedAccuracy"
                rules={[{ required: true, message: 'Please input wanted accuracy!' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.1} />
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
        <Col span={16}>
          {iterationResults.length > 0 && (
            <Card title="Iteration Results" style={{ marginBottom: '24px' }}>
              <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                {iterationResults.map((result, index) => (
                  <div key={index}>
                    {JSON.stringify(result, null, 2)}
                  </div>
                ))}
              </pre>
              {message && <Paragraph strong>{message}</Paragraph>}
            </Card>
          )}

          {finalResult && (
            <Card title="Final Results">
              <Table 
                columns={finalResultColumns} 
                dataSource={finalResultData} 
                pagination={false}
                bordered
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default App;
