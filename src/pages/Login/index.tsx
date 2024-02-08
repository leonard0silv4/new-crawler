import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import instance from "@/config/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoad, setIsLoad] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    setIsLoad(true);
    instance
      .post("/login", {
        username: email,
        password,
      })
      .then((response: any) => {
        localStorage.setItem("userToken", response?.token);

        navigate("/");
      })
      .catch((err) => {
        toast.error("Erro ", {
          description: err?.response?.data?.error,
          position: "top-center",
        });
      })
      .finally(() => {
        setIsLoad(false);
      });

    e.preventDefault();
    return false;
  };

  useEffect(() => {
    if (window.localStorage !== undefined && localStorage.getItem("userToken"))
      navigate("/");
  }, []);

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-20 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Senha
                </label>
              </div>
              <div className="mt-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  placeholder="Senha"
                  autoComplete="password"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Button
                disabled={isLoad}
                onClick={(e) => handleSubmit(e)}
                type="submit"
                className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isLoad && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Login
              </Button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            <a
              href="/account-create"
              className="font-semibold leading-6 text-gray-950 hover:text-gray-700"
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
