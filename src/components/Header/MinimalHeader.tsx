import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  handleAuthentication?: (boolean: boolean) => void;
}

const HeaderMinimal = ({ handleAuthentication }: HeaderProps) => {
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
        <div className="lg:flex lg:flex-1 lg:justify-center">
          <a
            title="Sair"
            className="text-sm flex font-semibold leading-6 text-zinc-200 cursor-pointer"
            onClick={logout}
          >
            <LogOut />
          </a>
        </div>
      </nav>
    </header>
  );
};

export default HeaderMinimal;
