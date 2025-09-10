import { useEffect, useState } from "react";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Chart from "../../components/ui/Charts";
import { FaNotesMedical } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";

const CashierDashboard = () => {
  const [stats, setStats] = useState({
    medicines: 0,
    todayTransactions: 0,
    todayRevenue: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [medicinesRes, transactionsRes] = await Promise.all([
          api.get("/medicine/all-medicines"),
          api.get("/transaction/all-transactions"),
        ]);

        const medicines = medicinesRes.data.medicines || [];
        const transactions = transactionsRes.data.transactions || [];

        // Hitung jumlah obat per kategori
        const categoryCount = {};
        medicines.forEach((med) => {
          const category = med.category || "Tidak Dikategorikan";
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categoryChartData = Object.entries(categoryCount).map(
          ([label, value]) => ({
            label,
            value,
          })
        );

        const today = new Date().toISOString().split("T")[0];
        const todayTransactions = transactions.filter((t) =>
          t.createdAt.startsWith(today)
        );

        const todayRevenue = todayTransactions.reduce(
          (sum, t) => sum + (t.totalAmount || 0),
          0
        );

        setStats({
          medicines: medicines.length,
          todayTransactions: todayTransactions.length,
          todayRevenue,
        });

        setCategoryData(categoryChartData);
      } catch (error) {
        console.error("Error fetching cashier stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <h1 className="text-2xl font-bold text-indigo-800 mb-6">
        Dashboard Kasir
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card
          title="Total Obat"
          value={stats.medicines}
          icon={<FaNotesMedical color="#ff6e6e" />}
          color="bg-red-100 text-red-600"
        />
        <Card
          title="Transaksi Hari Ini"
          value={stats.todayTransactions}
          icon={<FaMoneyBillTransfer color="#22C55E" />}
          color="bg-green-100 text-green-600"
        />
        <Card
          title="Pendapatan Hari Ini"
          value={`Rp ${stats.todayRevenue.toLocaleString("id-ID")}`}
          icon={<BiSolidReport color="#F59E0B" />}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Grafik Transaksi Harian
          </h2>
          <Chart type="line" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Kategori Obat</h2>
          <Chart type="pie" data={categoryData} />
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
