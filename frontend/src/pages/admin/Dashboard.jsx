import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Chart from '../../components/ui/Charts';
import { FaUser } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";

const AdminDashboard = () => {
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
        const [usersRes, medicinesRes] = await Promise.all([
          api.get('/user/all-users'),
          api.get('/medicine/all-medicines'),
          // api.get('/transaction'),
        ]);

        // const revenue = transactionsRes.data.transactions.reduce(
        //   (sum, transaction) => sum + transaction.totalPrice,
        //   0
        // );

        setStats({
          users: usersRes.data.users.length,
          medicines: medicinesRes.data.medicines.length,
          // transactions: transactionsRes.data.transactions.length,
          // revenue,
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Users"
          value={stats.users}
          icon={<FaUser color='#3B82F6'/>}
          color="bg-blue-100 text-blue-600"
        />
        <Card
          title="Total Medicines"
          value={stats.medicines}
          icon={<FaNotesMedical color='#3B82F6'/>}
          color="bg-green-100 text-green-600"
        />
        {/* <Card
          title="Total Transactions"
          value={stats.transactions}
          icon="receipt"
          color="bg-purple-100 text-purple-600"
        /> */}
        {/* <Card
          title="Total Revenue"
          value={`Rp ${stats.revenue.toLocaleString()}`}
          icon="attach_money"
          color="bg-yellow-100 text-yellow-600"
        /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <Chart type="line" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Medicine Categories</h2>
          <Chart type="pie" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;