import { Link } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/userContext"; // Importa el contexto
import icono from "../img/unixfyone.png";
import foto from "../img/user-bg.png";
import { AiOutlineCaretDown, AiOutlineCaretUp, AiOutlineLogout } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";

// profile menu component
const profileMenuItems = [
  {
    label: "Mi Perfil",
    icon: <CgProfile />,
  },
  {
    label: "Cerrar Sesión",
    icon: <AiOutlineLogout />,
  },
];

function TopNavComponent({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout, login } = useUser();
  const name = [user.first_name] + " " + [user.last_name]
  return (
    <div className=" h-20">
      <nav className="bg-gray-800 top-nav">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-20 items-center justify-between">
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/Home">
                  <img className="h-16 w-auto" src={icono} alt="UnixFyOne" />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:block ">
                <div className="flex space-x-1 mt-4">
                  <Link
                    to="/purchases/layout"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Purchases
                  </Link>
                  <Link
                    to="/Home"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Assets
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <button
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </button>
              {/* <!-- Profile dropdown */}
              <div className="relative mr-2">
                <div className="flex flex-1 justify-between">
                  <p className="text-gray-300 text-sm font-medium py-2 p-1">
                    {name}
                  </p>
                  <button
                    onClick={() => setIsOpen((pre) => !pre)}
                    className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src={foto} alt="" />
                    {isOpen ? (
                      <AiOutlineCaretDown className="h-8" style={{color: 'white'}}/>
                    ) : (
                      <AiOutlineCaretUp className="h-8" style={{color: 'white'}}/>
                    )}
                  </button>
                  {isOpen && (
                    <div className="top-10 w-auto h-auto bg-slate-200 text-sm absolute flex flex-col items-start rounded-lg p-2">
                      {profileMenuItems.map((item, i) => (
                        <div
                          className="flex w-full text-sm justify-between p-2 bg-slate-200 hover:bg-slate-500 hover:text-white cursor-pointer border-l-transparent hover:border-l-indigo-500 border-l-4 rounded-lg"
                          key={i}
                        >
                          <h3 className="h-8">{item.icon}</h3>
                          <h3 className="ml-1 text-sm" onClick={logout} >{item.label}</h3>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*<!-- Mobile menu, show/hide based on menu state. */}
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {/*<!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
            <Link
              to="/purchases/layout"
              className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              Purchases
            </Link>
            <Link
              to="/Home"
              className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              Assets
            </Link>
         </div>
        </div>
      </nav>
    </div>
  );
}

export default TopNavComponent;
