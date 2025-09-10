import { Link } from "react-router-dom";
import moment from "moment";
import { FaEdit, FaTrash } from "react-icons/fa"; // <-- Tambah icon

const MedicineTable = ({ medicines, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gambar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Obat
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Harga
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kadaluarsa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {medicines.length > 0 ? (
            medicines.map((medicine) => (
              <tr key={medicine._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`http://localhost:8001${medicine.image}`}
                    alt={medicine.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {medicine.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {medicine.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rp {medicine.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medicine.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {moment(medicine.expired).format("DD MMM YYYY")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <Link
                      to={`/medicines/edit/${medicine._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Obat"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => onDelete(medicine._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus Obat"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Tidak ada obat
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MedicineTable;
