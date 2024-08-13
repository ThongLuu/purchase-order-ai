import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

interface User {
  id: string;
  username: string;
  role: string;
}

interface UserManagementProps {
  showMessage: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ showMessage }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    // TODO: Fetch users from API
    const mockData: User[] = [
      { id: '1', username: 'john_doe', role: 'normal' },
      { id: '2', username: 'jane_smith', role: 'manager' },
    ];
    setUsers(mockData);
  }, []);

  const roleOptions = [
    { label: 'Normal User', value: 'normal' },
    { label: 'Manager', value: 'manager' },
    { label: 'Admin', value: 'admin' },
  ];

  const handleAddUser = () => {
    if (username && role) {
      const newUser: User = {
        id: (users.length + 1).toString(),
        username,
        role,
      };
      setUsers([...users, newUser]);
      setUsername('');
      setRole('');
      showMessage('success', 'User Added', `User ${username} has been added successfully.`);
    } else {
      showMessage('warn', 'Invalid Input', 'Please enter both username and role.');
    }
  };

  const handleDeleteUser = (user: User) => {
    const updatedUsers = users.filter((u) => u.id !== user.id);
    setUsers(updatedUsers);
    showMessage('info', 'User Deleted', `User ${user.username} has been deleted.`);
  };

  const actionTemplate = (rowData: User) => {
    return <Button label="Delete" className="p-button-danger" onClick={() => handleDeleteUser(rowData)} />;
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(usernameFilter.toLowerCase()) &&
      (roleFilter === '' || user.role === roleFilter)
    );
  });

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <div className="p-grid">
        <div className="p-col-12 p-md-4">
          <InputText placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="p-col-12 p-md-4">
          <Dropdown
            value={role}
            options={roleOptions}
            onChange={(e) => setRole(e.value)}
            placeholder="Select Role"
          />
        </div>
        <div className="p-col-12 p-md-4">
          <Button label="Add User" onClick={handleAddUser} />
        </div>
      </div>
      <div className="p-grid p-mt-3">
        <div className="p-col-12 p-md-6">
          <InputText
            placeholder="Filter by Username"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
          />
        </div>
        <div className="p-col-12 p-md-6">
          <Dropdown
            value={roleFilter}
            options={[{ label: 'All Roles', value: '' }, ...roleOptions]}
            onChange={(e) => setRoleFilter(e.value)}
            placeholder="Filter by Role"
          />
        </div>
      </div>
      <DataTable value={filteredUsers} className="p-mt-3">
        <Column field="id" header="ID" />
        <Column field="username" header="Username" />
        <Column field="role" header="Role" />
        <Column body={actionTemplate} header="Action" />
      </DataTable>
    </div>
  );
};

export default UserManagement;