import React, { useRef, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const toastRef = useRef<Toast>(null);

  const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toastRef.current?.show({ severity, summary, detail });
  };

  const handlePurchaseOrderSubmit = (data: any) => {
    // Here you would typically send the data to your backend API
    console.log('Purchase Order submitted:', data);
    showMessage('success', 'Purchase Order Submitted', 'Your purchase order has been successfully submitted.');
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }

    // Log the API URL
    console.log('API URL:', process.env.REACT_APP_API_URL);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Toast ref={toastRef} />
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} showMessage={showMessage} /> : <Navigate to="/dashboard" />} />
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
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;