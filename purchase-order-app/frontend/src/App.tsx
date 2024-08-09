import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import PurchaseOrderList from './components/PurchaseOrderList';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toastRef = useRef<Toast>(null);

  const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toastRef.current?.show({ severity, summary, detail });
  };

  const handlePurchaseOrderSubmit = (data: any) => {
    // Here you would typically send the data to your backend API
    console.log('Purchase Order submitted:', data);
    showMessage('success', 'Purchase Order Submitted', 'Your purchase order has been successfully submitted.');
  };

  return (
    <Router>
      <div className="App">
        <Toast ref={toastRef} />
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} showMessage={showMessage} />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard showMessage={showMessage} /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-orders"
            element={isAuthenticated ? <PurchaseOrderList showMessage={showMessage} /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-purchase-order"
            element={isAuthenticated ? <PurchaseOrderForm onSubmit={handlePurchaseOrderSubmit} showMessage={showMessage} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;