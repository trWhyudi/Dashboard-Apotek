import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import api from "../../utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Chart = ({ type, role }) => {
  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi fetch untuk chart line harian (kasir)
  const fetchDailyLineChartData = async () => {
    try {
      const response = await api.get("/transaction/all-transactions");
      const transactions = response.data.transactions;

      const dailyRevenue = {};
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dailyRevenue[key] = 0;
      }

      transactions.forEach((trx) => {
        if (trx.status !== "completed") return;

        const trxDate = new Date(trx.createdAt);
        const dateKey = trxDate.toISOString().split("T")[0];

        if (dateKey in dailyRevenue) {
          trx.items.forEach((item) => {
            dailyRevenue[dateKey] += item.subtotal;
          });
        }
      });

      const labels = Object.keys(dailyRevenue);
      const data = Object.values(dailyRevenue);

      setLineData({
        labels,
        datasets: [
          {
            label: "Pendapatan Harian (Rp)",
            data,
            borderColor: "rgb(79, 70, 229)",
            backgroundColor: "rgba(79, 70, 229, 0.5)",
            fill: true,
            tension: 0.3,
          },
        ],
      });
    } catch (error) {
      console.error("Gagal mengambil data transaksi harian:", error);
    }
  };

  // Fungsi fetch untuk chart line bulanan (admin)
  const fetchMonthlyLineChartData = async () => {
    try {
      const response = await api.get("/transaction/all-transactions");
      const transactions = response.data.transactions;

      const monthlyRevenue = Array(12).fill(0);
      const monthsLabel = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      transactions.forEach((trx) => {
        if (trx.status !== "completed") return;

        const trxDate = new Date(trx.createdAt);
        const monthIndex = trxDate.getMonth();

        trx.items.forEach((item) => {
          monthlyRevenue[monthIndex] += item.subtotal;
        });
      });

      setLineData({
        labels: monthsLabel,
        datasets: [
          {
            label: "Pendapatan Bulanan (Rp)",
            data: monthlyRevenue,
            borderColor: "rgb(79, 70, 229)",
            backgroundColor: "rgba(79, 70, 229, 0.5)",
            fill: true,
            tension: 0.3,
          },
        ],
      });
    } catch (error) {
      console.error("Gagal mengambil data transaksi bulanan:", error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const response = await api.get("/medicine/all-medicines");
      const medicines = response.data.medicines;

      const categoryCount = {};

      medicines.forEach((med) => {
        const category = med.category || "Tidak Dikategorikan";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categoryLabels = Object.keys(categoryCount);
      const categoryValues = Object.values(categoryCount);

      setPieData({
        labels: categoryLabels,
        datasets: [
          {
            data: categoryValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Gagal mengambil data obat:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (type === "line") {
      if (role === "Kasir") {
        fetchDailyLineChartData().finally(() => setLoading(false));
      } else if (role === "Admin") {
        fetchMonthlyLineChartData().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else if (type === "pie") {
      fetchPieChartData().finally(() => setLoading(false));
    }
  }, [type, role]);

  if (loading) {
    return <div className="text-center py-10">Loading chart...</div>;
  }

  return (
    <div className="h-64">
      {type === "line" && lineData ? (
        <Line data={lineData} options={{ maintainAspectRatio: false }} />
      ) : type === "pie" && pieData ? (
        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
      ) : (
        <div className="text-center text-red-500">
          Data chart tidak tersedia.
        </div>
      )}
    </div>
  );
};

export default Chart;
