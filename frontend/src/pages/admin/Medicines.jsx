import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MedicineTable from '../../components/medicine/MedicineTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { IoMdAddCircleOutline } from "react-icons/io";
import Swal from 'sweetalert2';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const medicinesPerPage = 10;

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        let response;
        if (searchTerm.trim()) {
          response = await api.get(`/medicine/search-medicines?name=${encodeURIComponent(searchTerm)}`);
        } else {
          response = await api.get('/medicine/all-medicines');
        }
        setMedicines(response.data.medicines);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [searchTerm]);

  // Pagination logic
  const indexOfLastMedicine = currentPage * medicinesPerPage;
  const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
  const currentMedicines = medicines.slice(indexOfFirstMedicine, indexOfLastMedicine);
  const totalPages = Math.ceil(medicines.length / medicinesPerPage);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'font-semibold',
        cancelButton: 'font-semibold'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/medicine/delete-medicine/${id}`);
        setMedicines(prev => prev.filter(medicine => medicine._id !== id));
        Swal.fire('Deleted!', 'Obat berhasil dihapus.', 'success');
      } catch (error) {
        console.error('Error deleting medicine:', error);
        Swal.fire('Error!', 'Gagal menghapus obat.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-indigo-600 h-16 w-16"></div>
      </div>
    );
  }

  return (
    <main className="ml-64 pt-16 p-8 mt-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900">Data Obat</h1>
        <Link
          to="/medicines/create"
          className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          <IoMdAddCircleOutline className="mr-2 text-xl" />
          Tambah Obat
        </Link>
      </header>

      <section className="mb-6 max-w-md">
        <SearchBar
          placeholder="Cari obat berdasarkan nama..."
          onSearch={handleSearch}
          value={searchTerm}
        />
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <MedicineTable
          medicines={currentMedicines}
          onDelete={handleDelete}
        />
        {medicines.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </main>
  );
};

export default AdminMedicines;
