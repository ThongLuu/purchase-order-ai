import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

interface PurchaseOrder {
  id: string;
  sku: string;
  quantity: number;
  creator: string;
  approver: string;
  supplier: string;
  store: string;
  createdDate: string;
  expectedDeliveryDate: string;
}

interface ReviewProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const Review: React.FC<ReviewProps> = ({ showMessage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState('');

  useEffect(() => {
    // TODO: Fetch purchase orders from API
    const mockData: PurchaseOrder[] = [
      { id: '1', sku: 'SKU001', quantity: 10, creator: 'John Doe', approver: '', supplier: 'Supplier A', store: 'Store 1', createdDate: '2023-05-01', expectedDeliveryDate: '2023-05-15' },
      { id: '2', sku: 'SKU002', quantity: 5, creator: 'John Doe', approver: '', supplier: 'Supplier A', store: 'Store 1', createdDate: '2023-05-01', expectedDeliveryDate: '2023-05-15' },
      { id: '3', sku: 'SKU003', quantity: 8, creator: 'Alice Johnson', approver: '', supplier: 'Supplier B', store: 'Store 2', createdDate: '2023-05-02', expectedDeliveryDate: '2023-05-16' },
      { id: '4', sku: 'SKU004', quantity: 12, creator: 'Alice Johnson', approver: '', supplier: 'Supplier B', store: 'Store 2', createdDate: '2023-05-02', expectedDeliveryDate: '2023-05-16' },
    ];
    setPurchaseOrders(mockData);
  }, []);

  const storeOptions = [
    { label: 'All Stores', value: null },
    { label: 'Store 1', value: 'Store 1' },
    { label: 'Store 2', value: 'Store 2' },
  ];

  const handleApprove = (order: PurchaseOrder) => {
    // TODO: Implement API call to approve purchase order
    showMessage('success', 'Purchase Order Approved', `Purchase order ${order.id} has been approved.`);
  };

  const handleReject = (order: PurchaseOrder) => {
    // TODO: Implement API call to reject purchase order
    showMessage('info', 'Purchase Order Rejected', `Purchase order ${order.id} has been rejected.`);
  };

  const actionTemplate = (rowData: PurchaseOrder) => {
    return (
      <>
        <Button label="Approve" className="p-button-success p-mr-2" onClick={() => handleApprove(rowData)} />
        <Button label="Reject" className="p-button-danger" onClick={() => handleReject(rowData)} />
      </>
    );
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    return (
      (selectedStore === null || order.store === selectedStore) &&
      order.store.toLowerCase().includes(storeFilter.toLowerCase())
    );
  });

  return (
    <div className="review">
      <h2>Review Purchase Orders</h2>
      <div className="p-d-flex p-ai-center p-mb-3">
        <Dropdown
          value={selectedStore}
          options={storeOptions}
          onChange={(e) => setSelectedStore(e.value)}
          placeholder="Store"
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by store"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        />
        <Button label="Apply Filter" className="p-ml-2" />
      </div>
      <DataTable value={filteredPurchaseOrders}>
        <Column field="sku" header="SKU" />
        <Column field="quantity" header="Quantity" />
        <Column field="creator" header="Creator" />
        <Column field="approver" header="Approver" />
        <Column field="supplier" header="Supplier" />
        <Column field="store" header="Store" />
        <Column field="createdDate" header="Created Date" />
        <Column field="expectedDeliveryDate" header="Expected Delivery Date" />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>
    </div>
  );
};

export default Review;