import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Table from '../../components/ui/Table';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/all-users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = users.map((user) => ({
    ...user,
    actions: (
      <div className="space-x-2">
        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </div>
    ),
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Add User
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <Table headers={headers} data={tableData} />
      </div>
    </div>
  );
};

export default AdminUsers;