import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Message } from 'primereact/message';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sku: '',
    productName: '',
    store: '',
    createdDate: null as Date | null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        navigate('/login');
        return;
      }
      const response = await axios.get<PurchaseOrder[]>('http://localhost:5000/api/purchase-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("response", response);
      
      // Ensure that the response data is an array
      if (Array.isArray(response.data)) {
        setPurchaseOrders(response.data);
      } else {
        console.error('Invalid response data:', response.data);
        setError('Received invalid data from the server. Please try again.');
        setPurchaseOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      let errorMessage = 'Failed to fetch purchase orders. Please try again.';
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          errorMessage = axiosError.response.data.message || axiosError.message;
        } else if (axiosError.request) {
          errorMessage = 'No response received from the server. Please check your network connection.';
        }
        if (axiosError.response && axiosError.response.status === 401) {
          errorMessage = 'You are not logged in. Please log in and try again.';
          navigate('/login');
        }
      }
      setError(errorMessage);
      setPurchaseOrders([]);
      setLoading(false);
    }
  };

  const handleCreatePurchaseOrder = () => {
    navigate('/create-purchase-order');
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters({ ...filters, [field]: value });
  };

  const filteredPurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders.filter((order) => {
    return (
      order.sku.toLowerCase().includes(filters.sku.toLowerCase()) &&
      order.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      order.store.toLowerCase().includes(filters.store.toLowerCase()) &&
      (filters.createdDate === null || order.createdDate === filters.createdDate?.toISOString().split('T')[0])
    );
  }) : [];

  return (
    <div className="purchase-order-list">
      {error && (
        <Message severity="error" text={error} style={{ width: '100%', marginBottom: '20px' }} />
      )}
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
      <DataTable value={filteredPurchaseOrders} className="p-mt-3" loading={loading}>
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