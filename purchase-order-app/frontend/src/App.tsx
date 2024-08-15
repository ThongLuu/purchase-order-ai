import React, { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
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

const App: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toastRef = useRef<Toast>(null);

  const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toastRef.current?.show({ severity, summary, detail });
  };

  const handlePurchaseOrderSubmit = async (data: PurchaseOrderData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create purchase order');
      }

      await response.json(); // Consume the response but don't use it
      showMessage('success', 'Purchase Order Submitted', 'Your purchase order has been successfully submitted and saved.');
      
      // Redirect to the purchase order list page
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error submitting purchase order:', error);
      showMessage('error', 'Submission Failed', error instanceof Error ? error.message : 'There was an error submitting your purchase order. Please try again.');
    }
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
  );
};

const AppWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <App navigate={navigate} />;
};

const RoutedApp: React.FC = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default RoutedApp;