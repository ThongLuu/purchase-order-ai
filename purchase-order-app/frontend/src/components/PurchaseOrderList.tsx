import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    name: string;
    contactInfo: string;
  };
  totalAmount: number;
  deliveryDate: string;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

interface PurchaseOrderListProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ showMessage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receivedItems, setReceivedItems] = useState<{ [key: string]: { quantity: number; notes: string } }>({});

  useEffect(() => {
    // TODO: Fetch purchase orders from API
    const mockData: PurchaseOrder[] = [
      {
        id: '1',
        orderNumber: 'PO-0001',
        supplier: { name: 'Supplier A', contactInfo: 'contact@suppliera.com' },
        totalAmount: 1000,
        deliveryDate: '2023-05-15',
        status: 'pending',
        items: [
          { description: 'Item 1', quantity: 10, price: 50 },
          { description: 'Item 2', quantity: 5, price: 100 },
        ],
      },
      {
        id: '2',
        orderNumber: 'PO-0002',
        supplier: { name: 'Supplier B', contactInfo: 'contact@supplierb.com' },
        totalAmount: 2000,
        deliveryDate: '2023-05-20',
        status: 'approved',
        items: [
          { description: 'Item 3', quantity: 20, price: 75 },
          { description: 'Item 4', quantity: 10, price: 50 },
        ],
      },
    ];
    setPurchaseOrders(mockData);
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const actionTemplate = (rowData: PurchaseOrder) => {
    return (
      <>
        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-mr-2" onClick={() => showDetails(rowData)} />
        {rowData.status === 'approved' && (
          <Button icon="pi pi-check" className="p-button-rounded p-button-success" onClick={() => showReceiveForm(rowData)} />
        )}
      </>
    );
  };

  const showDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const showReceiveForm = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setReceivedItems(
      order.items.reduce((acc, item) => {
        acc[item.description] = { quantity: item.quantity, notes: '' };
        return acc;
      }, {} as { [key: string]: { quantity: number; notes: string } })
    );
    setShowReceiveDialog(true);
  };

  const handleReceiveSubmit = () => {
    // TODO: Implement API call to update received items
    console.log('Received items:', receivedItems);
    setShowReceiveDialog(false);
    // Update the status of the order in the list
    setPurchaseOrders(
      purchaseOrders.map((order) =>
        order.id === selectedOrder?.id ? { ...order, status: 'delivered' } : order
      )
    );
    showMessage('success', 'Order Received', `Order ${selectedOrder?.orderNumber} has been marked as delivered.`);
  };

  return (
    <div>
      <h2>Purchase Orders</h2>
      <DataTable value={purchaseOrders}>
        <Column field="orderNumber" header="Order Number" />
        <Column field="supplier.name" header="Supplier" />
        <Column field="totalAmount" header="Total Amount" body={(rowData) => formatCurrency(rowData.totalAmount)} />
        <Column field="deliveryDate" header="Delivery Date" />
        <Column field="status" header="Status" />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>

      <Dialog header="Purchase Order Details" visible={showDetailsDialog} onHide={() => setShowDetailsDialog(false)}>
        {selectedOrder && (
          <div>
            <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
            <p><strong>Supplier:</strong> {selectedOrder.supplier.name}</p>
            <p><strong>Contact:</strong> {selectedOrder.supplier.contactInfo}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
            <p><strong>Delivery Date:</strong> {selectedOrder.deliveryDate}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <h3>Items</h3>
            <DataTable value={selectedOrder.items}>
              <Column field="description" header="Description" />
              <Column field="quantity" header="Quantity" />
              <Column field="price" header="Price" body={(rowData) => formatCurrency(rowData.price)} />
            </DataTable>
          </div>
        )}
      </Dialog>

      <Dialog header="Receive Order" visible={showReceiveDialog} onHide={() => setShowReceiveDialog(false)}>
        {selectedOrder && (
          <div>
            <h3>Receive Items for PO-{selectedOrder.orderNumber}</h3>
            {selectedOrder.items.map((item) => (
              <div key={item.description} className="p-field">
                <label>{item.description}</label>
                <InputNumber
                  value={receivedItems[item.description]?.quantity}
                  onValueChange={(e) =>
                    setReceivedItems({
                      ...receivedItems,
                      [item.description]: { ...receivedItems[item.description], quantity: e.value as number },
                    })
                  }
                  max={item.quantity}
                />
                <InputTextarea
                  value={receivedItems[item.description]?.notes}
                  onChange={(e) =>
                    setReceivedItems({
                      ...receivedItems,
                      [item.description]: { ...receivedItems[item.description], notes: e.target.value },
                    })
                  }
                  rows={2}
                  placeholder="Notes (e.g., damages, discrepancies)"
                />
              </div>
            ))}
            <Button label="Submit" onClick={handleReceiveSubmit} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseOrderList;