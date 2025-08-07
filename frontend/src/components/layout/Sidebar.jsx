import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { FaNotesMedical } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { FaUserEdit } from "react-icons/fa";

const Sidebar = () => {
  const { user } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <MdSpaceDashboard color='#3B82F6'/> },
    { name: 'Users', path: '/admin/users', icon: <FaUser color='#3B82F6'/> },
    { name: 'Medicines', path: '/admin/medicines', icon: <FaNotesMedical color='#3B82F6'/> },
    { name: 'Transactions', path: '/admin/transactions', icon: <FaMoneyBillTransfer color='#3B82F6'/> },
    { name: 'Reports', path: '/admin/reports', icon: <BiSolidReport color='#3B82F6'/> },
    { name: 'Profile', path: '/admin/profile', icon: <FaUserEdit color='#3B82F6'/> },
  ];

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: 'dashboard' },
    { name: 'Profile', path: '/customer/profile', icon: 'person' },
  ];

  const links = user?.role === 'Admin' ? adminLinks : customerLinks;

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
                <span className="material-icons-outlined mr-3 text-lg">
                  {link.icon}
                </span>
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