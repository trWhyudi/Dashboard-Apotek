import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Table from '../../components/ui/Table';
import Swal from 'sweetalert2';

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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/user/delete-user/${id}`);
        setUsers(users.filter(user => user._id !== id));
        Swal.fire('Deleted!', 'Pengguna berhasil dihapus.', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('Error!', 'Gagal menghapus pengguna.', 'error');
      }
    }
  };

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = users.map((user) => ({
    ...user,
    actions: (
      <button
        onClick={() => handleDelete(user._id)}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
    ),
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users List</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Table headers={headers} data={tableData} />
      </div>
    </div>
  );
};

export default AdminUsers;