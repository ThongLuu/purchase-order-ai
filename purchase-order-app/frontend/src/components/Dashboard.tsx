import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import PurchaseOrderList from './PurchaseOrderList';
import PurchaseOrderForm from './PurchaseOrderForm';

interface DashboardProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showMessage }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCreatePurchaseOrder = (data: any) => {
    // TODO: Implement API call to create purchase order
    console.log('Creating purchase order:', data);
    showMessage('success', 'Success', 'Purchase order created successfully');
  };

  return (
    <div className="p-m-4">
      <h1>Procurement Manager Dashboard</h1>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Purchase Orders">
          <PurchaseOrderList showMessage={showMessage} />
        </TabPanel>
        <TabPanel header="Create Purchase Order">
          <PurchaseOrderForm onSubmit={handleCreatePurchaseOrder} showMessage={showMessage} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Dashboard;