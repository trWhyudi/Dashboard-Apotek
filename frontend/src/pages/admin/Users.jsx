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
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'font-semibold',
        cancelButton: 'font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/user/delete-user/${id}`);
        setUsers((prev) => prev.filter(user => user._id !== id));
        Swal.fire('Berhasil!', 'Pengguna berhasil dihapus.', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('Error!', 'Gagal menghapus pengguna.', 'error');
      }
    }
  };

  const headers = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Aksi', className: 'text-center' },
  ];

  const tableData = users.map(user => ({
    ...user,
    actions: (
      <button
        onClick={() => handleDelete(user._id)}
        className="px-4 py-2 text-sm font-medium rounded-md border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition shadow-sm hover:shadow-md"
        aria-label={`Hapus pengguna ${user.name}`}
        title={`Hapus pengguna ${user.name}`}
      >
        Hapus
      </button>
    )
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <main className="ml-64 pt-16 p-8 mt-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900">List Pengguna</h1>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <Table headers={headers} data={tableData} />
      </section>
    </main>
  );
};

export default AdminUsers;
