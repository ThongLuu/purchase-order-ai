import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";

interface PurchaseOrder {
  _id: string;
  purchaseOrderNumber: string;
  supplier: {
    name: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryDate: string;
  status: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface ReviewProps {
  showMessage: (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ) => void;
}

const Review: React.FC<ReviewProps> = ({ showMessage }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState("");
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [orderNumberFilter, setOrderNumberFilter] = useState("");

  const navigate = useNavigate();

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get<{ purchaseOrders: PurchaseOrder[] }>(
        "http://192.168.17.19:3001/api/purchase-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data.purchaseOrders)) {
        setPurchaseOrders(response.data.purchaseOrders);
      } else {
        console.error("Invalid response data:", response.data);
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      let errorMessage = "Failed to fetch purchase orders. Please try again.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          errorMessage = axiosError.response.data.message || axiosError.message;
        } else if (axiosError.request) {
          errorMessage =
            "No response received from the server. Please check your network connection.";
        }
        if (axiosError.response && axiosError.response.status === 401) {
          errorMessage = "You are not logged in. Please log in and try again.";
          navigate("/login");
        }
      }
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const storeOptions = [
    { label: "All Stores", value: null },
    { label: "Store 1", value: "Store 1" },
    { label: "Store 2", value: "Store 2" },
  ];

  const handleStatusUpdate = async (
    order: PurchaseOrder,
    status: "approved" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showMessage("error", "Error", "You are not logged in. Please log in and try again.");
        navigate("/login");
        return;
      }

      const response = await axios.patch(
        `/api/purchase-orders/${order._id}/status`,
        { status },
        {
          baseURL: process.env.REACT_APP_API_URL || "http://192.168.17.19:3001",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 seconds timeout
        }
      );
      const updatedOrder = response.data;
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((po) =>
          po._id === updatedOrder._id ? updatedOrder : po
        )
      );
      showMessage(
        "success",
        "Purchase Order Updated",
        `Purchase order ${order.purchaseOrderNumber} has been ${status}.`
      );
    } catch (error) {
      console.error(`Error ${status} purchase order:`, error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        let errorMessage = `Failed to ${status} purchase order: ${axiosError.message}`;
        if (axiosError.response) {
          errorMessage = `Failed to ${status} purchase order: ${axiosError.response.status} ${axiosError.response.statusText}`;
          console.error("Response data:", axiosError.response.data);
        } else if (axiosError.request) {
          errorMessage = `No response received from the server. Please check your network connection.`;
        }
        showMessage("error", "Error", errorMessage);
      } else {
        showMessage(
          "error",
          "Error",
          `An unknown error occurred while ${status} the purchase order`
        );
      }
    }
  };

  const handleApprove = (order: PurchaseOrder) => {
    handleStatusUpdate(order, "approved");
  };

  const handleReject = (order: PurchaseOrder) => {
    handleStatusUpdate(order, "rejected");
  };

  const actionTemplate = (rowData: PurchaseOrder) => {
    return (
      <>
        <Button
          label="Approve"
          className="p-button-success p-mr-2"
          onClick={() => handleApprove(rowData)}
          disabled={rowData.status !== "pending"}
        />
        <Button
          label="Reject"
          className="p-button-danger"
          onClick={() => handleReject(rowData)}
          disabled={rowData.status !== "pending"}
        />
      </>
    );
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    return (
      (selectedStore === null || order.supplier?.name === selectedStore) &&
      (order.supplier?.name?.toLowerCase().includes(storeFilter.toLowerCase()) ?? false) &&
      (orderNumberFilter === "" || order.purchaseOrderNumber.includes(orderNumberFilter))
    );
  });

  const openPurchaseOrderDetails = (order: PurchaseOrder) => {
    setSelectedPurchaseOrder(order);
    setDialogVisible(true);
  };

  const PurchaseOrderDetailsDialog = () => {
    if (!selectedPurchaseOrder) return null;

    return (
      <Dialog
        header={`Purchase Order Details: ${selectedPurchaseOrder.purchaseOrderNumber}`}
        visible={dialogVisible}
        style={{ width: '80vw' }}
        onHide={() => setDialogVisible(false)}
      >
        <div className="p-grid">
          <div className="p-col-6">
            <p><strong>Supplier:</strong> {selectedPurchaseOrder.supplier?.name}</p>
            <p><strong>Total Amount:</strong> {selectedPurchaseOrder.totalAmount}</p>
            <p><strong>Delivery Date:</strong> {selectedPurchaseOrder.deliveryDate}</p>
          </div>
          <div className="p-col-6">
            <p><strong>Status:</strong> {selectedPurchaseOrder.status}</p>
            <p><strong>Created Date:</strong> {selectedPurchaseOrder.createdAt}</p>
            <p><strong>Created By:</strong> {selectedPurchaseOrder.createdBy?.name}</p>
          </div>
        </div>
        <h3>Product List</h3>
        <DataTable value={selectedPurchaseOrder.items}>
          <Column field="description" header="Description" />
          <Column field="quantity" header="Quantity" />
          <Column field="price" header="Price" />
          <Column body={(rowData) => (rowData.quantity || 0) * (rowData.price || 0)} header="Total" />
        </DataTable>
      </Dialog>
    );
  };

  const handleQrCodeResult = (result: string) => {
    setOrderNumberFilter(result);
    setQrScannerVisible(false);
    showMessage("success", "QR Code Scanned", `Filtered by Order Number: ${result}`);
  };

  const QRCodeScanner = () => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current) {
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => handleQrCodeResult(result.data),
          { returnDetailedScanResult: true }
        );
        qrScanner.start();

        return () => {
          qrScanner.destroy();
        };
      }
    }, []);

    return (
      <Dialog
        header="Scan QR Code"
        visible={qrScannerVisible}
        style={{ width: '50vw' }}
        onHide={() => setQrScannerVisible(false)}
      >
        <video ref={videoRef} style={{ width: '100%' }} />
      </Dialog>
    );
  };

  return (
    <div className="review">
      <h2>Review Purchase Orders</h2>
      <div className="p-d-flex p-ai-center p-mb-3">
        <Dropdown
          value={selectedStore}
          options={storeOptions}
          onChange={(e) => setSelectedStore(e.value)}
          placeholder="Supplier"
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by supplier"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="p-mr-2"
        />
        <InputText
          placeholder="Filter by Order Number"
          value={orderNumberFilter}
          onChange={(e) => setOrderNumberFilter(e.target.value)}
          className="p-mr-2"
        />
        <Button
          label="Scan QR Code"
          icon="pi pi-qrcode"
          onClick={() => setQrScannerVisible(true)}
        />
      </div>
      <DataTable 
        value={filteredPurchaseOrders} 
        loading={loading}
        onRowClick={(e) => openPurchaseOrderDetails(e.data as PurchaseOrder)}
      >
        <Column field="purchaseOrderNumber" header="Order Number" />
        <Column field="supplier.name" header="Supplier" />
        <Column field="totalAmount" header="Total Amount" />
        <Column field="deliveryDate" header="Delivery Date" />
        <Column field="status" header="Status" />
        <Column field="createdAt" header="Created Date" />
        <Column field="createdBy.name" header="Created By" />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>
      <PurchaseOrderDetailsDialog />
      <QRCodeScanner />
    </div>
  );
};

export default Review;
