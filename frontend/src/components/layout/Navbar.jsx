import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  const { user, logout, logoutLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            Apotek Munggaran
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none"
                >
                  <img
                    src={
                      user.avatar?.startsWith("blob:")
                        ? user.avatar
                        : user.avatar
                        ? `http://localhost:8001${user.avatar}`
                        : "/images/default-avatar.png"
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <span>
                    {user.name} ({user.role})
                  </span>
                  <FaChevronDown className="ml-1 text-xs" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <CgProfile className="text-lg" />
                        Profil
                      </Link>

                      <button
                        onClick={logout}
                        disabled={logoutLoading}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${
                          logoutLoading
                            ? "text-gray-400"
                            : "text-red-600 hover:bg-gray-100"
                        }`}
                      >
                        <IoMdLogOut className="text-lg" />
                        {logoutLoading ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1 text-indigo-600 border border-indigo-600 rounded-md text-sm hover:bg-indigo-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
