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
    { name: 'Dashboard', path: '/dashboard', icon: <MdSpaceDashboard className="text-indigo-500" /> },
    { name: 'Profil', path: '/profile', icon: <FaUserEdit className="text-indigo-500" /> },
    { name: 'Obat', path: '/medicines', icon: <FaNotesMedical className="text-indigo-500" /> },
    { name: 'Transaksi', path: '/transactions', icon: <FaMoneyBillTransfer className="text-indigo-500" /> },
  ];

  const adminOnlyLinks = [
    { name: 'Pengguna', path: '/users', icon: <FaUser className="text-indigo-500" /> },
    { name: 'Laporan', path: '/reports', icon: <BiSolidReport className="text-indigo-500" /> },
  ];

  const links = user.role === 'Admin'
    ? [...commonLinks, ...adminOnlyLinks]
    : commonLinks;

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen fixed pt-16 bg-gradient-to-b from-white to-gray-100 border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 text-[15px] font-semibold rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-100 text-indigo-700 shadow-inner border-l-4 border-indigo-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'}`
                }
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;