import { Button } from "@/components/ui/button";
import instance from "@/config/axios";
import { memo, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

interface NavUserProps {
  setForceUpdate?: (bl: boolean) => void;
}

const NavUser = memo(({ setForceUpdate }: NavUserProps) => {
  const [register, setRegisters] = useState<any[]>([]);
  const navigate = useNavigate();
  let { user } = useParams();

  useEffect(() => {
    instance
      .get("factionist")
      .then((response: any) => {
        const updatedRegisters = response.map((register: any) => ({
          ...register,
        }));
        setRegisters(updatedRegisters);
      })
      .catch((err) => console.log(err))
      .finally(() => console.log(false));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div className="flex gap-3 justify-center items-center">
        {register?.map((usr) => {
          return (
            <Button
              onClick={() => {
                navigate(`/job/${usr._id}`);
                setForceUpdate && setForceUpdate(true);
              }}
              className="capitalize mt-3"
              variant={user == usr._id ? "default" : "ghost"}
            >
              {usr.username}
            </Button>
          );
        })}
      </div>
    </div>
  );
});

export default NavUser;
