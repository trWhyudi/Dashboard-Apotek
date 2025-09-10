import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Chart from '../../components/ui/Charts';
import { FaUser } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    medicines: 0,
    transactions: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, medicinesRes, transactionsRes] = await Promise.all([
          api.get('/user/all-users'),
          api.get('/medicine/all-medicines'),
          api.get('/transaction/all-transactions'),
        ]);

        const transactions = transactionsRes.data.transactions || [];

        const revenue = transactions.reduce(
          (sum, transaction) => sum + (transaction.totalAmount || 0),
          0
        );

        setStats({
          users: usersRes.data.users.length,
          medicines: medicinesRes.data.medicines.length,
          transactions: transactions.length,
          revenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <h1 className="text-2xl font-bold text-indigo-800 mb-6">👋 Selamat Datang {user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Pengguna"
          value={stats.users}
          icon={<FaUser color='#3B82F6' />}
          color="bg-blue-100 text-blue-600"
        />
        <Card
          title="Total Obat"
          value={stats.medicines}
          icon={<FaNotesMedical color='#ff6e6e' />}
          color="bg-red-100 text-red-600"
        />
        <Card
          title="Total Transaksi"
          value={stats.transactions}
          icon={<FaMoneyBillTransfer color='#22C55E' />}
          color="bg-green-100 text-green-600"
        />
        <Card
          title="Total Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString('id-ID')}`}
          icon={<BiSolidReport color='#F59E0B' />}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Grafik Pendapatan</h2>
          <Chart type="line" role="Admin" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Kategori Obat</h2>
          <Chart type="pie" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
