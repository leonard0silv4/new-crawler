import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  handleAuthentication?: (boolean: boolean) => void;
}

const HeaderMinimal = ({ handleAuthentication }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

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
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            title="Sair"
            href="#"
            className="text-sm flex font-semibold leading-6 text-zinc-200"
            onClick={logout}
          >
            <LogOut />
          </a>
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
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
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

export default HeaderMinimal;
