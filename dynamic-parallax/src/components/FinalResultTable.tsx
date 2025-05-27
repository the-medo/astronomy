import React from 'react';
import { Table } from 'antd';
import { FinalResult } from '../types/FinalResult';

interface FinalResultTableProps {
  finalResult: FinalResult | null;
  opacity?: number;
}

const FinalResultTable: React.FC<FinalResultTableProps> = ({ finalResult, opacity = 1 }) => {
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
        { key: '4', parameter: 'STAR 1: Weight', value: `${finalResult.M1.toFixed(3)} Ms` },
        { key: '5', parameter: 'STAR 2: Abs. Magnitude', value: `${finalResult.MAG2.toFixed(2)}` },
        { key: '6', parameter: 'STAR 2: Weight', value: `${finalResult.M2.toFixed(3)} Ms` },
      ]
    : [];

  return (
    <div style={{ overflowX: 'auto', opacity }}>
      <Table
        size="small"
        columns={finalResultColumns}
        dataSource={finalResultData}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </div>
  );
};

export default FinalResultTable;