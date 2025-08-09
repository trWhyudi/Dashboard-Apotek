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
import api from '../../utils/api'; // Pastikan path-nya benar

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

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicine/all-medicines');
        const medicines = response.data.medicines;

        // Generate data untuk line chart (revenue per bulan)
        const monthlyRevenue = Array(12).fill(0);
        const categoryCount = {};

        medicines.forEach((med) => {
          const date = new Date(med.createdAt);
          const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec

          // Akumulasi revenue
          monthlyRevenue[monthIndex] += med.price * med.stock;

          // Akumulasi kategori
          categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
        });

        // Buat data untuk line chart
        const lineChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue (Rp)',
              data: monthlyRevenue,
              borderColor: 'rgb(79, 70, 229)',
              backgroundColor: 'rgba(79, 70, 229, 0.5)',
            },
          ],
        };

        // Buat data untuk pie chart
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
              ],
            },
          ],
        };

        setLineData(lineChartData);
        setPieData(pieChartData);
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
      }
    };

    fetchMedicines();
  }, []);

  if (!lineData || !pieData) {
    return <div className="text-center py-10">Loading chart...</div>;
  }

  return (
    <div className="h-64">
      {type === 'line' ? (
        <Line data={lineData} options={{ maintainAspectRatio: false }} />
      ) : (
        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
      )}
    </div>
  );
};

export default Chart;
