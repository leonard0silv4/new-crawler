// import { Bolt, LogOut, Users } from "lucide-react";
import { Bolt, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  handleAuthentication?: (boolean: boolean) => void;
}

const Header = ({ handleAuthentication }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const logout = () => {
    handleAuthentication && handleAuthentication(false);
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="bg-zinc-800">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-50"
            onClick={() => setMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <NavLink
            className={({ isActive }: any) =>
              `${
                isActive ? "underline " : ""
              } text-sm font-semibold leading-6 text-zinc-200 cursor-pointer`
            }
            to="/"
          >
            Mercado livre
          </NavLink>
          <NavLink
            className={({ isActive }: any) =>
              `${
                isActive ? "underline " : ""
              } text-sm font-semibold leading-6 text-zinc-200 cursor-pointer`
            }
            to="/shopee"
          >
            Shopee
          </NavLink>
        </div>
        <div className="hidden lg:flex lg:flex-3 lg:justify-end items-center gap-6">
          <TooltipProvider>
            {/* Faccionistas */}
            {/* <Tooltip>
              <TooltipTrigger>
                <NavLink className="text-zinc-200" to="/users">
                  <Users className="h-6 w-6" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>
                <p>Faccionistas</p>
              </TooltipContent>
            </Tooltip> */}

            {/* Configurações */}
            <Tooltip>
              <TooltipTrigger>
                <NavLink className="text-zinc-200" to="/config">
                  <Bolt className="h-6 w-6" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>

            {/* Sair */}
            <Tooltip>
              <TooltipTrigger>
                <a className="text-zinc-200 cursor-pointer" onClick={logout}>
                  <LogOut className="h-6 w-6" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>
      {menuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <NavLink
                    className={({ isActive }: any) =>
                      `${
                        isActive ? "underline " : ""
                      } -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer`
                    }
                    to="/"
                  >
                    Mercado livre
                  </NavLink>
                  <NavLink
                    className={({ isActive }: any) =>
                      `${
                        isActive ? "underline " : ""
                      } -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer`
                    }
                    to="/shopee"
                  >
                    Shoppe
                  </NavLink>
                </div>
                <div className="py-6">
                  {/* <NavLink
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    to="/users"
                  >
                    Faccionistas
                  </NavLink> */}

                  <NavLink
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    to="/config"
                  >
                    Configurações
                  </NavLink>
                  <a
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer"
                    onClick={logout}
                  >
                    Sair
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
