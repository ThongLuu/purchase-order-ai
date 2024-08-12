import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, showMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Temporarily use a hardcoded URL
      const apiUrl = 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
          showMessage('success', 'Success', 'Logged in successfully');
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          showMessage('error', 'Error', errorData.message || 'Invalid credentials');
        }
      } else {
        const textResponse = await response.text();
        console.error('Response is not JSON:', textResponse);
        showMessage('error', 'Error', `Unexpected response from server: ${textResponse.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('error', 'Error', `An error occurred during login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card title="Login" style={{ width: '25rem' }}>
        <form onSubmit={handleLogin}>
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="email">Email</label>
              <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="p-field">
              <label htmlFor="password">Password</label>
              <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" label="Login" />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;