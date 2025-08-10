import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaNotesMedical, FaUserEdit } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const commonLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdSpaceDashboard color='#4F46E5' /> },
    { name: 'Profil', path: '/profile', icon: <FaUserEdit color='#4F46E5' /> },
    { name: 'Obat', path: '/medicines', icon: <FaNotesMedical color='#4F46E5' /> },
    { name: 'Transaksi', path: '/transactions', icon: <FaMoneyBillTransfer color='#4F46E5' /> },
  ];

  const adminOnlyLinks = [
    { name: 'Pengguna', path: '/users', icon: <FaUser color='#4F46E5' /> },
    { name: 'Laporan', path: '/reports', icon: <BiSolidReport color='#4F46E5' /> },
  ];

  const links = user.role === 'Admin'
    ? [...commonLinks, ...adminOnlyLinks]
    : commonLinks;

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen fixed pt-16 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
