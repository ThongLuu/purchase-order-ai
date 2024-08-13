import React from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';

interface DashboardProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showMessage }) => {
  const totalQuantity = 4699;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Total Quantity by Week',
        data: [800, 1200, 1000, 1400, 1600],
        backgroundColor: '#4DD0E1',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const purchaseOrders = [
    { sku: 'SKU001', quantity: 85, creator: 'Emma Davis', approver: 'Grace Lee', supplier: 'Supplier A', store: 'Store A', createdDate: '2023-05-05', expectedDeliveryDate: '2023-05-20' },
    { sku: 'SKU002', quantity: 50, creator: 'Emma Davis', approver: 'Grace Lee', supplier: 'Supplier A', store: 'Store A', createdDate: '2023-05-05', expectedDeliveryDate: '2023-05-20' },
    { sku: 'SKU003', quantity: 75, creator: 'Alice Johnson', approver: 'John Smith', supplier: 'Supplier B', store: 'Store B', createdDate: '2023-05-05', expectedDeliveryDate: '2023-05-13' },
    { sku: 'SKU004', quantity: 1, creator: 'Alice Johnson', approver: 'John Smith', supplier: 'Supplier C', store: 'Store C', createdDate: '2023-05-05', expectedDeliveryDate: '2023-05-13' },
    { sku: 'SKU005', quantity: 35, creator: 'Alice Johnson', approver: 'John Smith', supplier: 'Supplier E', store: 'Store E', createdDate: '2023-05-15', expectedDeliveryDate: '2023-05-25' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div>
          <span>Total Quantity: {totalQuantity}</span>
          <Button label="View by Supplier" className="p-button-outlined p-button-secondary" />
        </div>
      </div>
      <div className="chart-container">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
      <DataTable value={purchaseOrders} paginator rows={5} className="p-datatable-sm">
        <Column field="sku" header="SKU" sortable />
        <Column field="quantity" header="Quantity" sortable />
        <Column field="creator" header="Creator" sortable />
        <Column field="approver" header="Approver" sortable />
        <Column field="supplier" header="Supplier" sortable />
        <Column field="store" header="Store" sortable />
        <Column field="createdDate" header="Created Date" sortable />
        <Column field="expectedDeliveryDate" header="Expected Delivery Date" sortable />
      </DataTable>
    </div>
  );
};

export default Dashboard;