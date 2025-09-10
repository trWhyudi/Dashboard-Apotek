import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  FiEdit,
  FiLogOut,
  FiSave,
  FiX,
  FiMail,
  FiUser,
  FiCamera,
} from "react-icons/fi";
import { MdOutlinePassword } from "react-icons/md";
import Swal from "sweetalert2";

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/me");
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
        });
        setAvatar(response.data.user.avatar);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Gagal memuat data profil",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteAvatar = async () => {
    setAvatar(null);
    setRemoveAvatar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);

      if (fileInputRef.current?.files[0]) {
        formDataToSend.append("avatar", fileInputRef.current.files[0]);
      }

      if (removeAvatar) {
        formDataToSend.append("removeAvatar", "true");
      }

      await api.put(`/user/update-user/${user._id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = await api.get("/user/me");
      setUser(updated.data.user);

      setAvatar(updated.data.user.avatar);
      setFormData({
        name: updated.data.user.name,
        email: updated.data.user.email,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      });

      setEditMode(false);
      setRemoveAvatar(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Gagal memperbarui profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Logout Gagal",
        text: "Gagal logout. Silakan coba lagi.",
      });
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 px-6 mt-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6 group w-32 h-32">
            <img
              src={
                avatar?.startsWith("blob:")
                  ? avatar
                  : avatar
                  ? `http://localhost:8001${avatar}`
                  : "/images/default-avatar.png"
              }
              alt="Profil"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />

            {editMode && (
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition"
                  title="Ganti foto"
                >
                  <FiCamera size={20} />
                </button>
              </div>
            )}

            {editMode && avatar && !avatar.startsWith("blob:") && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="absolute top-0 right-0 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow transition"
                title="Hapus foto"
              >
                <FiX size={14} />
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-semibold text-gray-800">
              Pengaturan Profil
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all"
            >
              <FiLogOut size={18} />
              Keluar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <span className="flex items-center gap-1">
                <FiUser /> Nama Lengkap
              </span>
            </label>
            {editMode ? (
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            ) : (
              <p className="text-gray-800 text-lg">{formData.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <span className="flex items-center gap-1">
                <FiMail /> Alamat Email
              </span>
            </label>
            {editMode ? (
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            ) : (
              <p className="text-gray-800 text-lg">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full capitalize
              ${
                user?.role === "admin"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user?.role}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setRemoveAvatar(false);
                    setAvatar(user?.avatar);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  <FiX /> Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-50"
                >
                  <FiSave />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
              >
                <FiEdit />
                Edit Profil
              </button>
            )}
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MdOutlinePassword size={20} />
            Ganti Password
          </h2>
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline font-medium"
          >
            Reset password via email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
