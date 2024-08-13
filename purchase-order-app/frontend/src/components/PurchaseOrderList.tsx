import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';

interface PurchaseOrder {
  id: string;
  sku: string;
  productName: string;
  store: string;
  createdDate: string;
}

interface PurchaseOrderListProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ showMessage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filters, setFilters] = useState({
    sku: '',
    productName: '',
    store: '',
    createdDate: null as Date | null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch purchase orders from API
    const mockData: PurchaseOrder[] = [
      { id: '1', sku: 'SKU001', productName: 'Product 1', store: 'Store A', createdDate: '2023-05-01' },
      { id: '2', sku: 'SKU002', productName: 'Product 2', store: 'Store B', createdDate: '2023-05-02' },
      { id: '3', sku: 'SKU003', productName: 'Product 3', store: 'Store C', createdDate: '2023-05-03' },
    ];
    setPurchaseOrders(mockData);
  }, []);

  const handleCreatePurchaseOrder = () => {
    navigate('/create-purchase-order');
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters({ ...filters, [field]: value });
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    return (
      order.sku.toLowerCase().includes(filters.sku.toLowerCase()) &&
      order.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      order.store.toLowerCase().includes(filters.store.toLowerCase()) &&
      (filters.createdDate === null || order.createdDate === filters.createdDate?.toISOString().split('T')[0])
    );
  });

  return (
    <div className="purchase-order-list">
      <div className="p-d-flex p-jc-between p-ai-center">
        <h2>Purchase Order List</h2>
        <Button label="Create Purchase Order" icon="pi pi-plus" onClick={handleCreatePurchaseOrder} />
      </div>
      <div className="p-d-flex p-mt-3">
        <InputText
          placeholder="Filter by SKU"
          value={filters.sku}
          onChange={(e) => handleFilterChange('sku', e.target.value)}
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by Product Name"
          value={filters.productName}
          onChange={(e) => handleFilterChange('productName', e.target.value)}
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by Store"
          value={filters.store}
          onChange={(e) => handleFilterChange('store', e.target.value)}
          className="p-mr-2"
        />
        <Calendar
          placeholder="Filter by Created Date"
          value={filters.createdDate}
          onChange={(e) => handleFilterChange('createdDate', e.value as Date | null)}
          showIcon
        />
      </div>
      <DataTable value={filteredPurchaseOrders} className="p-mt-3">
        <Column field="id" header="ID" />
        <Column field="sku" header="SKU" />
        <Column field="productName" header="Product Name" />
        <Column field="store" header="Store" />
        <Column field="createdDate" header="Created Date" />
      </DataTable>
    </div>
  );
};

export default PurchaseOrderList;