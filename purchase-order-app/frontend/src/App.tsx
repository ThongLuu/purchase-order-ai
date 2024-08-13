import React, { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import PurchaseOrderList from './components/PurchaseOrderList';
import Review from './components/Review';
import UserManagement from './components/UserManagement';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <nav className="layout-nav">
        <div className="menu-icon">&#9776;</div>
        <h1>Purchase Order System</h1>
      </nav>
      <div className="layout-content">
        <aside className="layout-sidebar">
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/create-purchase-order">Create Order</Link></li>
            <li><Link to="/purchase-orders">Order List</Link></li>
            <li><Link to="/review">Review</Link></li>
            <li><Link to="/user-management">User Management</Link></li>
          </ul>
        </aside>
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toastRef = useRef<Toast>(null);

  const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toastRef.current?.show({ severity, summary, detail });
  };

  const handlePurchaseOrderSubmit = (data: any) => {
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
            element={isAuthenticated ? <Layout><Dashboard showMessage={showMessage} /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-orders"
            element={isAuthenticated ? <Layout><PurchaseOrderList showMessage={showMessage} /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/create-purchase-order"
            element={isAuthenticated ? <Layout><PurchaseOrderForm onSubmit={handlePurchaseOrderSubmit} showMessage={showMessage} /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/review"
            element={isAuthenticated ? <Layout><Review showMessage={showMessage} /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/user-management"
            element={isAuthenticated ? <Layout><UserManagement showMessage={showMessage} /></Layout> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;