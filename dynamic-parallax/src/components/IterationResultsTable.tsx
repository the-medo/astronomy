import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { IterationResult } from '../types/IterationResult';

const IterationResultsTable: React.FC<{ data: IterationResult[] }> = ({ data }) => {
  const columns: ColumnsType<IterationResult> = [
    {
      title: '#',
      dataIndex: 'iteracia',
      key: 'iteracia',
      width: 40,
      fixed: 'left',
    },
    {
      title: 'a [AU]',
      dataIndex: 'a',
      key: 'a',
      width: 100,
      render: (value: number) => value.toFixed(4),
    },
    {
      title: 'd [pc]',
      dataIndex: 'd',
      key: 'd',
      width: 100,
      render: (value: number) => value.toFixed(4),
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
      title: 'L1 [W]',
      dataIndex: 'L1',
      key: 'L1',
      width: 100,
      render: (value: number) => value.toExponential(2),
    },
    {
      title: 'L2 [W]',
      dataIndex: 'L2',
      key: 'L2',
      width: 100,
      render: (value: number) => value.toExponential(2),
    },
    {
      title: 'M1 [Ms]',
      dataIndex: 'M1',
      key: 'M1',
      width: 100,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'M2 [Ms]',
      dataIndex: 'M2',
      key: 'M2',
      width: 100,
      render: (value: number) => value.toFixed(3),
    },
    {
      title: 'Diff [%]',
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

export default IterationResultsTable;