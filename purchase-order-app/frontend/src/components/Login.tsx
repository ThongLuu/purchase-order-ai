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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log('Login attempt with:', { username, password });
    setIsAuthenticated(true);
    showMessage('success', 'Success', 'Logged in successfully');
    navigate('/dashboard');
  };

  return (
    <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card title="Login" style={{ width: '25rem' }}>
        <form onSubmit={handleLogin}>
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
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