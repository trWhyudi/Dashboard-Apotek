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
  const [medicinesPerPage] = useState(10);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        let response;
        if (searchTerm) {
          response = await api.get(`/medicine/search-medicines?name=${searchTerm}`);
        } else {
          response = await api.get('/medicine/all-medicines');
        }
        console.log('API Response data:', response.data);
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
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/medicine/delete-medicine/${id}`);
        setMedicines(medicines.filter(medicine => medicine._id !== id));
        Swal.fire('Deleted!', 'The medicine has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting medicine:', error);
        Swal.fire('Error!', 'Failed to delete the medicine.', 'error');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medicine Management</h1>
        <Link
          to="/admin/medicines/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <span className="material-icons-outlined mr-1"> <IoMdAddCircleOutline /></span>
          Add Medicine
        </Link>
      </div>

      <div className="mb-6">
        <SearchBar 
          placeholder="Search medicines by name..." 
          onSearch={handleSearch}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
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
      </div>
    </div>
  );
};

export default AdminMedicines;