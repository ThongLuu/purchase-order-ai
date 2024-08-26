import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FileUpload } from "primereact/fileupload";
import { InputTextarea } from "primereact/inputtextarea";
import * as XLSX from "xlsx";
import SKUAutocomplete, { SKUAutocompleteProps } from "./SKUAutocomplete";
import { useLocation } from "react-router-dom";

interface SKU {
  sku: string;
  productName: string;
  description: string;
  quantity: number;
  price: number;
}

interface PurchaseOrderData {
  supplier: { name: string };
  items: SKU[];
  totalAmount: number;
  deliveryDate: string;
  status: string;
  type: string;
  creator: string;
  approver: string;
  store: string;
  createdDate: string;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: PurchaseOrderData) => void;
  showMessage: (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ) => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  onSubmit,
  showMessage,
}) => {
  const [type, setType] = useState("");
  const [creator, setCreator] = useState("");
  const [approver, setApprover] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [store, setStore] = useState("");
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const fileUploadRef = useRef<FileUpload>(null);
  const [pastedData, setPastedData] = useState("");
  const [generatedTable, setGeneratedTable] = useState<any[]>([]);

  const typeOptions = [
    { label: "Normal", value: "normal" },
    { label: "Campaign", value: "campaign" },
    { label: "Debt", value: "debt" },
  ];

  const creatorOptions = [
    { label: "John Doe", value: "John Doe" },
    { label: "Jane Smith", value: "Jane Smith" },
  ];

  const approverOptions = [
    { label: "Alice Johnson", value: "Alice Johnson" },
    { label: "Bob Williams", value: "Bob Williams" },
  ];

  const supplierOptions = [
    { label: "Supplier A", value: "Supplier A" },
    { label: "Supplier B", value: "Supplier B" },
    { label: "Supplier C", value: "Supplier C" },
  ];

  const storeOptions = [
    { label: "Store 1", value: "Store 1" },
    { label: "Store 2", value: "Store 2" },
    { label: "Store 3", value: "Store 3" },
  ];

  const [sheetUrl, setSheetUrl] = useState("");

  const handleImport = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL
    }/auth/google?sheetUrl=${encodeURIComponent(sheetUrl)}`;
  };
  const location = useLocation();

  useEffect(() => {
    // Lấy dữ liệu từ query params
    const queryParams = new URLSearchParams(location.search);
    const sheetData = queryParams.get("data");

    if (sheetData) {
      const data = JSON.parse(sheetData);
      const header = data[0];

      // Chuyển đổi các hàng tiếp theo thành các object
      const objectsArray = data.slice(1).map((row: { [x: string]: any }) => {
        let obj: { [key: string]: any } = {};
        header.forEach((key: string, index: number) => {
          obj[key] = row[index];
        });
        return obj;
      });
      const newSKUs: SKU[] = objectsArray.map((row: any) => ({
        sku: row.SKU?.toString() || "",
        productName: row.ProductName?.toString() || "",
        description: row.Description?.toString() || "",
        quantity: parseInt(row.Quantity, 10) || 0,
        price: parseFloat(row.Price) || 0,
      }));

      setSKUs(newSKUs);
    }
  }, [location]);
  
  const addSKU = () => {
    const newSKU: SKU = {
      sku: "",
      productName: "",
      description: "",
      quantity: 1,
      price: 0,
    };
    setSKUs([...skus, newSKU]);
  };

  const removeSKU = (index: number) => {
    const updatedSKUs = skus.filter((_, i) => i !== index);
    setSKUs(updatedSKUs);
  };

  const handleExcelUpload = (event: any) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newSKUs: SKU[] = data.map((row: any) => ({
          sku: row.SKU?.toString() || "",
          productName: row.ProductName?.toString() || "",
          description: row.Description?.toString() || "",
          quantity: parseInt(row.Quantity, 10) || 0,
          price: parseFloat(row.Price) || 0,
        }));

        if (newSKUs.length === 0) {
          throw new Error("No valid SKUs found in the Excel file");
        }

        // Merge existing SKUs with new SKUs
        const mergedSKUs = [...skus, ...newSKUs];
        setSKUs(mergedSKUs);
        showMessage(
          "success",
          "Excel Processed",
          `File processed and ${newSKUs.length} SKUs added successfully`
        );

        // Clear the file input
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        showMessage(
          "error",
          "Upload Failed",
          "There was an error processing the Excel file. Please check the file format and try again."
        );
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      showMessage(
        "error",
        "Upload Failed",
        "There was an error reading the file. Please try again."
      );
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !supplierName ||
      !type ||
      !creator ||
      !approver ||
      !store ||
      !createdDate ||
      !deliveryDate
    ) {
      showMessage(
        "warn",
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    if (skus.length === 0) {
      showMessage(
        "warn",
        "No SKUs",
        "Please add at least one SKU to the purchase order."
      );
      return;
    }

    const totalAmount = skus.reduce(
      (total, sku) => total + sku.quantity * sku.price,
      0
    );

    const purchaseOrderData: PurchaseOrderData = {
      supplier: { name: supplierName },
      items: skus,
      totalAmount,
      deliveryDate: deliveryDate.toISOString(),
      status: "pending",
      type,
      creator,
      approver,
      store,
      createdDate: createdDate.toISOString(),
    };

    onSubmit(purchaseOrderData);
  };

  const actionTemplate = (_: any, { rowIndex }: { rowIndex: number }) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-text"
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          removeSKU(rowIndex);
        }}
      />
    );
  };

  const handleSKUSelect = (rowIndex: number, product: any) => {
    const updatedSKUs = [...skus];
    updatedSKUs[rowIndex] = {
      ...updatedSKUs[rowIndex],
      sku: product.sku,
      productName: product.title,
      description: product.handle,
      price: product.price,
      quantity: updatedSKUs[rowIndex].quantity || 1, // Preserve existing quantity or set to 1 if not defined
    };
    setSKUs(updatedSKUs);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const skuEditor = (options: any) => {
    return (
      <SKUAutocomplete
        value={options.value}
        onChange={(value) => options.editorCallback(value)}
        onSelect={(product) => handleSKUSelect(options.rowIndex, product)}
        onKeyPress={handleKeyPress}
      />
    );
  };

  const inputEditor = (options: any, field: keyof SKU) => {
    return (
      <InputText
        value={options.value}
        onChange={(e) => {
          options.editorCallback(e.target.value);

          // Update the SKU in the state
          const updatedSKUs = [...skus];
          updatedSKUs[options.rowIndex] = {
            ...updatedSKUs[options.rowIndex],
            [field]: e.target.value,
          };
          setSKUs(updatedSKUs);
        }}
        onKeyPress={handleKeyPress}
      />
    );
  };

  const numberEditor = (options: any, field: "quantity" | "price") => {
    return (
      <InputText
        type="number"
        value={options.value}
        onChange={(e) => {
          const value =
            field === "quantity"
              ? parseInt(e.target.value, 10)
              : parseFloat(e.target.value);
          options.editorCallback(value);

          // Update the SKU in the state
          const updatedSKUs = [...skus];
          updatedSKUs[options.rowIndex] = {
            ...updatedSKUs[options.rowIndex],
            [field]: value,
          };
          setSKUs(updatedSKUs);
        }}
        onKeyPress={handleKeyPress}
      />
    );
  };

  const handlePastedData = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedData(e.target.value);
  };

  const generateTable = () => {
    const rows = pastedData.trim().split('\n');
    const headers = rows[0].split('\t');
    const data = rows.slice(1).map(row => {
      const values = row.split('\t');
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
    setGeneratedTable(data);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <h2>Create Purchase Order</h2>
      <div className="p-grid">
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="type">Type</label>
            <Dropdown
              id="type"
              value={type}
              options={typeOptions}
              onChange={(e) => setType(e.value)}
              placeholder="Select a Type"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="creator">Creator</label>
            <Dropdown
              id="creator"
              value={creator}
              options={creatorOptions}
              onChange={(e) => setCreator(e.value)}
              placeholder="Select a Creator"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="approver">Approver</label>
            <Dropdown
              id="approver"
              value={approver}
              options={approverOptions}
              onChange={(e) => setApprover(e.value)}
              placeholder="Select an Approver"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="supplierName">Supplier Name</label>
            <Dropdown
              id="supplierName"
              value={supplierName}
              options={supplierOptions}
              onChange={(e) => setSupplierName(e.value)}
              placeholder="Select a Supplier"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="store">Store</label>
            <Dropdown
              id="store"
              value={store}
              options={storeOptions}
              onChange={(e) => setStore(e.value)}
              placeholder="Select a Store"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="createdDate">Created Date</label>
            <Calendar
              id="createdDate"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.value as Date)}
              showIcon
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-4">
          <div className="p-field">
            <label htmlFor="deliveryDate">Delivery Date</label>
            <Calendar
              id="deliveryDate"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.value as Date)}
              showIcon
              required
            />
          </div>
        </div>
      </div>

      <h3>Items</h3>
      <DataTable value={skus} className="p-datatable-sm" editMode="cell">
        <Column field="sku" header="SKU" editor={skuEditor} />
        <Column
          field="productName"
          header="Product Name"
          editor={(options) => inputEditor(options, "productName")}
        />
        <Column
          field="description"
          header="Description"
          editor={(options) => inputEditor(options, "description")}
        />
        <Column
          field="quantity"
          header="Quantity"
          editor={(options) => numberEditor(options, "quantity")}
        />
        <Column
          field="price"
          header="Price"
          editor={(options) => numberEditor(options, "price")}
        />
        <Column body={actionTemplate} style={{ width: "4rem" }} />
      </DataTable>

      <div className="p-d-flex p-jc-between p-ai-center p-mt-2">
        <Button
          type="button"
          label="Add Item"
          icon="pi pi-plus"
          onClick={addSKU}
          className="p-button-secondary"
        />
        <div className="p-d-flex p-ai-center">
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            accept=".xlsx"
            maxFileSize={1000000}
            customUpload
            uploadHandler={handleExcelUpload}
            auto
            chooseLabel="Choose Excel File"
          />
        </div>
      </div>

      <h3>Paste Excel Data</h3>
      <InputTextarea
        value={pastedData}
        onChange={handlePastedData}
        rows={5}
        cols={30}
        autoResize
        placeholder="Paste your Excel data here"
      />
      <Button type="button" label="Generate Table" onClick={generateTable} className="p-mt-2" />

      {generatedTable.length > 0 && (
        <DataTable value={generatedTable} className="p-mt-2">
          {Object.keys(generatedTable[0]).map((key) => (
            <Column key={key} field={key} header={key} />
          ))}
        </DataTable>
      )}

      <div>
        <h2>Import Purchase Orders from Google Sheets</h2>
        <input
          type="text"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="Enter Google Sheet URL"
        />
        <button onClick={handleImport}>Import from Google Sheet</button>
      </div>

      <div className="p-d-flex p-jc-center p-mt-4">
        <Button
          type="submit"
          label="Create Purchase Order"
          icon="pi pi-check"
          className="p-button-primary"
          style={{ width: "100%" }}
        />
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
