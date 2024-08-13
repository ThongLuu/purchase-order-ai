import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';

interface SKU {
  sku: string;
  productName: string;
  quantity: number;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onSubmit, showMessage }) => {
  const [creator, setCreator] = useState('');
  const [approver, setApprover] = useState('');
  const [supplier, setSupplier] = useState('');
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | null>(null);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [excelUploaded, setExcelUploaded] = useState(false);

  const creatorOptions = [
    { label: 'John Doe', value: 'John Doe' },
    { label: 'Jane Smith', value: 'Jane Smith' },
  ];

  const approverOptions = [
    { label: 'Alice Johnson', value: 'Alice Johnson' },
    { label: 'Bob Williams', value: 'Bob Williams' },
  ];

  const supplierOptions = [
    { label: 'Supplier A', value: 'Supplier A' },
    { label: 'Supplier B', value: 'Supplier B' },
    { label: 'Supplier C', value: 'Supplier C' },
  ];

  const addSKU = () => {
    const newSKU: SKU = {
      sku: '',
      productName: '',
      quantity: 1,
    };
    setSKUs([...skus, newSKU]);
  };

  const removeSKU = (index: number) => {
    const updatedSKUs = skus.filter((_, i) => i !== index);
    setSKUs(updatedSKUs);
  };

  const handleExcelUpload = (event: any) => {
    // This function would typically parse the Excel file and add SKUs
    setExcelUploaded(true);
    showMessage('success', 'Excel Uploaded', 'File uploaded and data loaded successfully');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skus.length === 0) {
      showMessage('warn', 'No SKUs', 'Please add at least one SKU to the purchase order.');
      return;
    }
    onSubmit({
      creator,
      approver,
      supplier,
      createdDate,
      expectedDeliveryDate,
      skus,
    });
    showMessage('success', 'Purchase Order Created', 'The purchase order has been successfully created.');
  };

  const actionTemplate = (_: any, { rowIndex }: { rowIndex: number }) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-text"
        onClick={() => removeSKU(rowIndex)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <h2>Create Purchase Order</h2>
      <div className="p-grid">
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="creator">Creator</label>
            <Dropdown id="creator" value={creator} options={creatorOptions} onChange={(e) => setCreator(e.value)} placeholder="Select a Creator" required />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="approver">Approver</label>
            <Dropdown id="approver" value={approver} options={approverOptions} onChange={(e) => setApprover(e.value)} placeholder="Select an Approver" required />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="supplier">Supplier</label>
            <Dropdown id="supplier" value={supplier} options={supplierOptions} onChange={(e) => setSupplier(e.value)} placeholder="Select a Supplier" required />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="createdDate">Created Date</label>
            <Calendar id="createdDate" value={createdDate} onChange={(e) => setCreatedDate(e.value as Date)} showIcon required />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
            <Calendar id="expectedDeliveryDate" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.value as Date)} showIcon required />
          </div>
        </div>
      </div>

      <h3>SKUs</h3>
      <DataTable value={skus} className="p-datatable-sm">
        <Column field="sku" header="SKU" editor={(options) => <InputText value={options.value} onChange={(e) => options.editorCallback!(e.target.value)} />} />
        <Column field="productName" header="Product Name" editor={(options) => <InputText value={options.value} onChange={(e) => options.editorCallback!(e.target.value)} />} />
        <Column field="quantity" header="Quantity" editor={(options) => <InputText type="number" value={options.value} onChange={(e) => options.editorCallback!(parseInt(e.target.value, 10))} />} />
        <Column body={actionTemplate} style={{ width: '4rem' }} />
      </DataTable>

      <div className="p-d-flex p-jc-between p-ai-center p-mt-2">
        <Button type="button" label="Add SKU" icon="pi pi-plus" onClick={addSKU} className="p-button-secondary" />
        <div className="p-d-flex p-ai-center">
          <span className="p-mr-2">Upload Excel</span>
          <FileUpload mode="basic" accept=".xlsx" maxFileSize={1000000} onUpload={handleExcelUpload} chooseLabel="Choose Excel File" />
        </div>
      </div>

      {excelUploaded && (
        <div className="p-mt-2 p-mb-2 p-d-flex p-ai-center" style={{ color: '#4caf50', backgroundColor: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>
          <i className="pi pi-check-circle p-mr-2" style={{ fontSize: '1.2rem' }}></i>
          <span>File uploaded and data loaded successfully</span>
        </div>
      )}

      <div className="p-d-flex p-jc-center p-mt-4">
        <Button type="submit" label="Create Purchase Order" icon="pi pi-check" className="p-button-primary" style={{ width: '100%' }} />
      </div>
    </form>
  );
};

export default PurchaseOrderForm;