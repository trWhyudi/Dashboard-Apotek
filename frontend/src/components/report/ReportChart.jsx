import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => new Date(item.date).toLocaleDateString("id-ID")),
    datasets: [
      {
        label: "Penjualan",
        data: data.map((item) => item.sales),
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Transaksi",
        data: data.map((item) => item.transactions),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Tanggal",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Penjualan (IDR)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Jumlah Transaksi",
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Tren Penjualan dan Transaksi Harian",
      },
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label === "Penjualan") {
              label +=
                ": " +
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(context.raw);
            } else if (label === "Transaksi") {
              label += ": " + context.raw + " transaksi";
            }
            return label;
          },
          title: function (tooltipItems) {
            if (tooltipItems.length > 0) {
              const date = new Date(data[tooltipItems[0].dataIndex].date);
              return date.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <div className="h-96 w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ReportChart;
