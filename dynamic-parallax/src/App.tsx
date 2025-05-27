import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, Row, Table, Tabs, Typography, Alert } from 'antd';
import {
  runComputation,
  computeExcentricity,
  computeEllipsisArea,
  computePartialEllipsisArea,
  computePeriod,
} from './lib/compute';

// Import components
import SliderWithInput from './components/SliderWithInput';
import FormSliderWithInput from './components/FormSliderWithInput';
import IterationResultsTable from './components/IterationResultsTable';
import FinalResultTable from './components/FinalResultTable';

// Import types
import { FormValues } from './types/FormValues';
import { PageState } from './types/PageState';
import { IterationResult } from './types/IterationResult';
import { FinalResult } from './types/FinalResult';
import { ComputedValues } from './types/ComputedValues';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const App: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [computedValues, setComputedValues] = useState<ComputedValues | null>(null);
  const [iterationResults, setIterationResults] = useState<IterationResult[]>([]);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [message, setMessage] = useState<string>('');
  const [pageState, setPageState] = useState<PageState>('initial');

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

  // Function to read parameters from URL
  const getParamsFromUrl = (): Partial<FormValues> => {
    const params = new URLSearchParams(window.location.search);
    const urlParams: Partial<FormValues> = {};

    // Read each parameter from URL
    if (params.has('m1')) urlParams.m1 = Number(params.get('m1'));
    if (params.has('m2')) urlParams.m2 = Number(params.get('m2'));
    if (params.has('A')) urlParams.A = Number(params.get('A'));
    if (params.has('B')) urlParams.B = Number(params.get('B'));
    if (params.has('t')) urlParams.t = Number(params.get('t'));
    if (params.has('wantedAccuracy'))
      urlParams.wantedAccuracy = Number(params.get('wantedAccuracy'));

    return urlParams;
  };

  // Function to update URL with current parameters
  const updateUrlParams = (values: FormValues) => {
    const params = new URLSearchParams();

    // Only add parameters to URL if they differ from default values
    if (values.m1 !== defaultValues.m1) params.set('m1', values.m1.toString());
    if (values.m2 !== defaultValues.m2) params.set('m2', values.m2.toString());
    if (values.A !== defaultValues.A) params.set('A', values.A.toString());
    if (values.B !== defaultValues.B) params.set('B', values.B.toString());
    if (values.t !== defaultValues.t) params.set('t', values.t.toString());
    if (values.wantedAccuracy !== defaultValues.wantedAccuracy)
      params.set('wantedAccuracy', values.wantedAccuracy.toString());

    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
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

    // If we have already computed results, set the page state to outdated
    if (pageState === 'computed' && iterationResults.length > 0) {
      setPageState('outdated');
    }

    // Update URL parameters
    updateUrlParams(values);
  };

  // Handle form submission
  const onFinish = (values: FormValues) => {
    const { m1, m2, A, B, t, wantedAccuracy } = values;

    // Run the computation
    const result = runComputation(m1, m2, A, B, t, wantedAccuracy);

    // Update state with results
    setIterationResults(result.iterationResults);
    setFinalResult(result.finalResult ?? null);
    setMessage(result.message || '');

    // Update page state to computed
    setPageState('computed');
  };

  // Function to reset form to default values
  const resetForm = () => {
    form.setFieldsValue(defaultValues);
    updateComputedValues(defaultValues);

    // Initialize A and B values
    setAValue(defaultValues.A);
    setBValue(defaultValues.B);

    // Update URL parameters to default values
    updateUrlParams(defaultValues);

    // Set page state to outdated if there are already computed results
    if (iterationResults.length > 0) {
      setPageState('outdated');
    }
  };

  // Initialize form with default values and compute initial values
  useEffect(() => {
    // Get parameters from URL
    const urlParams = getParamsFromUrl();

    // Merge URL parameters with default values
    const initialValues: FormValues = {
      ...defaultValues,
      ...urlParams,
    };

    // Set form values
    form.setFieldsValue(initialValues);
    updateComputedValues(initialValues);

    // Initialize A and B values
    setAValue(initialValues.A);
    setBValue(initialValues.B);

    // Automatically trigger computation after page load
    const timer = setTimeout(() => {
      form.submit();
    }, 100);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, []);

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
                <FormSliderWithInput min={1} max={100} step={1} />
              </Form.Item>

              <Form.Item
                label="Wanted Accuracy [%] "
                name="wantedAccuracy"
                rules={[{ required: true, message: 'Please input wanted accuracy!' }]}
                style={{ marginBottom: 16 }}
              >
                <FormSliderWithInput
                  min={0.001}
                  max={5}
                  step={0.001}
                  formatter={value => `${value}%`}
                  marks={{ 0.1: '0.1%', 5: '5%' }}
                />
              </Form.Item>

              {/* Computed Values Section */}
              {computedValues && (
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <div
                    style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <Text strong>Excentricity (h):</Text> {computedValues.h.toFixed(2)}"
                  </div>
                  <div
                    style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <Text strong>Ellipsis Area (S):</Text>{' '}
                    <span>{computedValues.S.toFixed(2)} "²</span>
                  </div>
                  <div
                    style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <Text strong>Partial Ellipsis Area (eps): </Text>
                    <span> {computedValues.eps.toFixed(2)} "²</span>
                  </div>
                  <div
                    style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <Text strong>Period (T):</Text> {computedValues.T.toFixed(2)} yr
                  </div>
                </div>
              )}

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
                  Compute
                </Button>
                <Button onClick={resetForm}>Reset to assignment defaults</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Results */}
        <Col xs={24} sm={24} md={12} lg={12} xl={16}>
          {pageState === 'initial' && (
            <Alert
              message="Please press the 'Compute' button to see the results"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          {iterationResults.length > 0 && (
            <Card
              title={
                <>
                  Iteration Results
                  {pageState === 'outdated' && (
                    <span style={{ color: '#B8860B', fontWeight: 'bold', marginLeft: '8px' }}>
                      (computed with last input parameters!)
                    </span>
                  )}
                </>
              }
              style={{
                marginBottom: '8px',
                paddingBottom: 0,
                opacity: pageState === 'outdated' ? 0.5 : 1,
              }}
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
            <FinalResultTable
              finalResult={finalResult}
              opacity={pageState === 'outdated' ? 0.5 : 1}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default App;
