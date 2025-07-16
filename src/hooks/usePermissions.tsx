import { useContext, useCallback } from "react";
import { AuthContext } from "@/context/AuthContext";

export function usePermission() {
  const { permissions, role }: any = useContext(AuthContext);

  const can = useCallback(
    (...required: string[]) => {
      return required.every((p) => permissions?.includes(p));
    },
    [permissions]
  );

  const canAny = useCallback(
    (...required: string[]) => {
      return required.some((p) => permissions?.includes(p));
    },
    [permissions]
  );

  const isOwner = role === "owner";

  return { can, canAny, isOwner, permissions };
}
