import { useEffect, useState } from "react";
import api from "../../utils/api";
import Table from "../../components/ui/Table";
import Swal from "sweetalert2";

const baseURL = "http://localhost:8001";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/all-users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/user/update-role/${userId}`, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      Swal.fire("Berhasil!", "Role pengguna berhasil diperbarui.", "success");
    } catch (error) {
      console.error("Gagal memperbarui role:", error);
      Swal.fire("Error!", "Gagal memperbarui role pengguna.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "font-semibold",
        cancelButton: "font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/user/delete-user/${id}`);
        setUsers((prev) => prev.filter((user) => user._id !== id));
        Swal.fire("Berhasil!", "Pengguna berhasil dihapus.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error!", "Gagal menghapus pengguna.", "error");
      }
    }
  };

  const headers = [
    { key: "avatar", label: "Avatar" },
    { key: "name", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "actions", label: "Aksi", className: "text-center" },
  ];

  const getRoleSelector = (user) => {
    const handleChange = async (e) => {
      const newRole = e.target.value;
      if (newRole === user.role) return;

      const result = await Swal.fire({
        title: "Konfirmasi Ubah Role",
        html: `Apakah Anda yakin ingin mengubah role <b>${user.name}</b> menjadi <strong>${newRole}</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "Ya, Ubah",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "font-semibold",
          cancelButton: "font-semibold",
        },
      });

      if (result.isConfirmed) {
        await handleRoleChange(user._id, newRole);
      }
    };

    return (
      <select
        value={user.role}
        onChange={handleChange}
        className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="Admin">Admin</option>
        <option value="Kasir">Kasir</option>
      </select>
    );
  };

  const tableData = users.map((user) => ({
    avatar: user.avatar ? user.avatar : null,
    name: user.name,
    email: user.email,
    role: getRoleSelector(user),
    actions: (
      <button
        onClick={() => handleDelete(user._id)}
        className="px-4 py-2 text-sm font-medium rounded-md border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition shadow-sm hover:shadow-md"
        aria-label={`Hapus pengguna ${user.name}`}
        title={`Hapus pengguna ${user.name}`}
      >
        Hapus
      </button>
    ),
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="ml-64 pt-16 p-8 mt-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900">
          Daftar Pengguna
        </h1>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <Table headers={headers} data={tableData} />
      </section>
    </main>
  );
};

export default AdminUsers;
