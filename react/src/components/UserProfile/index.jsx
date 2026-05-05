import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { FaUserCircle, FaCaretDown, FaUser, FaLanguage, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfile = () => {
    navigate('/users/profile');
    setIsDropdownOpen(false);
  };

  const handleLanguage = () => {
    // Aquí puedes agregar lógica para cambiar idioma
    console.log('Cambiar idioma a español');
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-gray-600" />
        )}
        
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-xs text-gray-500">
            {user.email}
          </div>
        </div>
        
        <FaCaretDown className="text-gray-400" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleProfile}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <FaUser className="mr-3 text-gray-400" />
            Perfil
          </button>
          
          <button
            onClick={handleLanguage}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <FaLanguage className="mr-3 text-gray-400" />
            Español
          </button>
          
          <hr className="my-1 border-gray-200" />
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
