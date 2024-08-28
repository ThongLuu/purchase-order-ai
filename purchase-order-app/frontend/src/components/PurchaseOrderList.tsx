import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';

interface PurchaseOrderItem {
  description: string;
  quantity: number;
  price: number;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplier: {
    name: string;
  };
  totalAmount: number;
  deliveryDate: string;
  status: string;
  createdAt: string;
  items: PurchaseOrderItem[]; // Add this line
}

interface PurchaseOrderListProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ showMessage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    orderNumber: '',
    supplierName: '',
    status: '',
    createdDate: null as Date | null,
  });
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        navigate('/login');
        return;
      }
      const response = await axios.get<{ purchaseOrders: PurchaseOrder[] }>(`${process.env.REACT_APP_API_URL}/api/purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data.purchaseOrders)) {
        setPurchaseOrders(response.data.purchaseOrders);
      } else {
        console.error('Invalid response data:', response.data);
        setError('Received invalid data from the server. Please try again.');
        setPurchaseOrders([]);
      }
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
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleCreatePurchaseOrder = () => {
    navigate('/create-purchase-order');
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters({ ...filters, [field]: value });
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    return (
      (order.orderNumber?.toLowerCase().includes(filters.orderNumber.toLowerCase()) ?? false) &&
      (order.supplier?.name?.toLowerCase().includes(filters.supplierName.toLowerCase()) ?? false) &&
      (order.status?.toLowerCase().includes(filters.status.toLowerCase()) ?? false) &&
      (filters.createdDate === null || (order.createdAt && new Date(order.createdAt).toDateString() === filters.createdDate?.toDateString()))
    );
  });

  const openPurchaseOrderDetails = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setDialogVisible(true);
  };

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
          placeholder="Filter by Order Number"
          value={filters.orderNumber}
          onChange={(e) => handleFilterChange('orderNumber', e.target.value)}
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by Supplier Name"
          value={filters.supplierName}
          onChange={(e) => handleFilterChange('supplierName', e.target.value)}
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by Status"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="p-mr-2"
        />
        <Calendar
          placeholder="Filter by Created Date"
          value={filters.createdDate}
          onChange={(e) => handleFilterChange('createdDate', e.value as Date | null)}
          showIcon
        />
      </div>
      <DataTable 
        value={filteredPurchaseOrders} 
        className="p-mt-3" 
        loading={loading}
        selectionMode="single"
        onSelectionChange={(e) => openPurchaseOrderDetails(e.value)}
      >
        <Column field="orderNumber" header="Order Number" />
        <Column field="supplier.name" header="Supplier Name" />
        <Column field="totalAmount" header="Total Amount" />
        <Column field="deliveryDate" header="Delivery Date" />
        <Column field="status" header="Status" />
        <Column field="createdAt" header="Created Date" />
      </DataTable>

      <Dialog 
        header="Purchase Order Details" 
        visible={dialogVisible} 
        style={{ width: '50vw' }} 
        onHide={() => setDialogVisible(false)}
      >
        {selectedPurchaseOrder && (
          <div>
            <p><strong>Order Number:</strong> {selectedPurchaseOrder.orderNumber}</p>
            <p><strong>Supplier:</strong> {selectedPurchaseOrder.supplier.name}</p>
            <p><strong>Total Amount:</strong> {selectedPurchaseOrder.totalAmount}</p>
            <p><strong>Delivery Date:</strong> {selectedPurchaseOrder.deliveryDate}</p>
            <p><strong>Status:</strong> {selectedPurchaseOrder.status}</p>
            <p><strong>Created Date:</strong> {selectedPurchaseOrder.createdAt}</p>
            <h3>Items:</h3>
            <DataTable value={selectedPurchaseOrder.items}>
              <Column field="description" header="Description" />
              <Column field="quantity" header="Quantity" />
              <Column field="price" header="Price" />
              <Column field="price" header="Total" body={(rowData) => rowData.quantity * rowData.price} />
            </DataTable>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseOrderList;