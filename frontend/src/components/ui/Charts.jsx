import { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
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
} from 'chart.js';
import api from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ type }) => {
  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLineChartData = async () => {
    try {
      const response = await api.get('/transaction/all-transactions');
      const transactions = response.data.transactions;

      const monthlyRevenue = Array(12).fill(0); // Index 0 = Jan, 11 = Dec

      transactions.forEach((trx) => {
        if (trx.status !== 'completed') return;

        const trxDate = new Date(trx.createdAt);
        const monthIndex = trxDate.getMonth();

        trx.items.forEach((item) => {
          monthlyRevenue[monthIndex] += item.subtotal;
        });
      });

      const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Pendapatan (Rp)',
            data: monthlyRevenue,
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
          },
        ],
      };

      setLineData(lineChartData);
    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const response = await api.get('/medicine/all-medicines');
      const medicines = response.data.medicines;

      const categoryCount = {};

      medicines.forEach((med) => {
        categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
      });

      const categoryLabels = Object.keys(categoryCount);
      const categoryValues = Object.values(categoryCount);

      const pieChartData = {
        labels: categoryLabels,
        datasets: [
          {
            data: categoryValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
            ],
          },
        ],
      };

      setPieData(pieChartData);
    } catch (error) {
      console.error('Gagal mengambil data obat:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (type === 'line') {
      fetchLineChartData().finally(() => setLoading(false));
    } else if (type === 'pie') {
      fetchPieChartData().finally(() => setLoading(false));
    }
  }, [type]);

  if (loading) {
    return <div className="text-center py-10">Loading chart...</div>;
  }

  return (
    <div className="h-64">
      {type === 'line' && lineData ? (
        <Line data={lineData} options={{ maintainAspectRatio: false }} />
      ) : type === 'pie' && pieData ? (
        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
      ) : (
        <div className="text-center text-red-500">Data chart tidak tersedia.</div>
      )}
    </div>
  );
};

export default Chart;
