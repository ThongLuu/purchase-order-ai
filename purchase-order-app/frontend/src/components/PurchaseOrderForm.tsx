import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Item {
  description: string;
  quantity: number;
  price: number;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onSubmit, showMessage }) => {
  const [supplier, setSupplier] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>({ description: '', quantity: 0, price: 0 });

  const addItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.price > 0) {
      setItems([...items, newItem]);
      setNewItem({ description: '', quantity: 0, price: 0 });
    } else {
      showMessage('warn', 'Invalid Item', 'Please fill in all item fields with valid values.');
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showMessage('warn', 'No Items', 'Please add at least one item to the purchase order.');
      return;
    }
    onSubmit({
      supplier: {
        name: supplier,
        contactInfo: supplierContact,
      },
      items,
      totalAmount: calculateTotal(),
      deliveryDate,
    });
    showMessage('success', 'Purchase Order Created', 'The purchase order has been successfully created.');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="supplier">Supplier Name</label>
          <InputText id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
        </div>
        <div className="p-field">
          <label htmlFor="supplierContact">Supplier Contact</label>
          <InputText id="supplierContact" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="deliveryDate">Delivery Date</label>
          <Calendar id="deliveryDate" value={deliveryDate} onChange={(e) => setDeliveryDate(e.value as Date)} showIcon required />
        </div>
        <h3>Items</h3>
        <div className="p-grid">
          <div className="p-col">
            <InputText placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <div className="p-col">
            <InputNumber placeholder="Quantity" value={newItem.quantity} onValueChange={(e) => setNewItem({ ...newItem, quantity: e.value as number })} />
          </div>
          <div className="p-col">
            <InputNumber placeholder="Price" value={newItem.price} onValueChange={(e) => setNewItem({ ...newItem, price: e.value as number })} mode="currency" currency="USD" />
          </div>
          <div className="p-col">
            <Button type="button" icon="pi pi-plus" onClick={addItem} />
          </div>
        </div>
        <DataTable value={items}>
          <Column field="description" header="Description" />
          <Column field="quantity" header="Quantity" />
          <Column field="price" header="Price" body={(rowData) => `$${rowData.price.toFixed(2)}`} />
          <Column body={(rowData, { rowIndex }) => <Button icon="pi pi-trash" onClick={() => removeItem(rowIndex)} />} />
        </DataTable>
        <div className="p-field">
          <label>Total Amount: ${calculateTotal().toFixed(2)}</label>
        </div>
        <Button type="submit" label="Create Purchase Order" />
      </div>
    </form>
  );
};

export default PurchaseOrderForm;