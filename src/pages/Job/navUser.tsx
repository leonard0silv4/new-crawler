import { Button } from "@/components/ui/button";
import instance from "@/config/axios";
import { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotifyContext } from "@/context/NotifyContext";

interface NavUserProps {
  setForceUpdate?: (bl: boolean) => void;
}

const NavUser = memo(({}: NavUserProps) => {
  const navigate = useNavigate();
  const { user } = useParams();
  const { notifies, removeNotify } = useNotifyContext();

  const [register, setRegisters] = useState<any[]>([]);

  useEffect(() => {
    user && removeNotify(user);

    instance
      .get("factionist")
      .then((response: any) => {
        const updatedRegisters = response.map((register: any) => ({
          ...register,
        }));
        setRegisters(updatedRegisters);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div className="flex gap-3 justify-center items-center">
        {register?.map((usr) => {
          const notify = notifies.find((item) => item._id === usr._id);

          return (
            <Button
              key={usr._id}
              onClick={() => {
                navigate(`/job/${usr._id}`);
                removeNotify(usr._id);
              }}
              className="capitalize mt-3 relative"
              variant={user == usr._id ? "default" : "ghost"}
            >
              {usr.username}

              {notify && notify.qty > 0 && (
                <span className="absolute top-0.5 right-0.5 grid min-h-[12px] min-w-[12px] translate-x-2/4 -translate-y-2/4 place-items-center rounded-full bg-blue-500 py-1 px-1 text-xs text-white"></span>
                // <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-rose-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                //   {notify.qty}
                // </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
});

export default NavUser;
