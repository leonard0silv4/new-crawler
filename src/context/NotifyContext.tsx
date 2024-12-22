import React, { createContext, useContext, useState, useCallback } from "react";

interface NotifyItem {
  _id: string;
  qty: number;
}

interface NotifyContextData {
  notifies: NotifyItem[];
  addOrUpdateNotify: (id: string) => void;
  removeNotify: (id: string) => void;
  clearNotifies: () => void;
}

const NotifyContext = createContext<NotifyContextData | undefined>(undefined);

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifies, setNotifiesState] = useState<NotifyItem[]>([]);

  const addOrUpdateNotify = useCallback((id: string) => {
    setNotifiesState((prev) => {
      const existingNotify = prev.find((notify) => notify._id === id);
      if (existingNotify) {
        return prev.map((notify) =>
          notify._id === id ? { ...notify, qty: notify.qty + 1 } : notify
        );
      }
      return [...prev, { _id: id, qty: 1 }];
    });
  }, []);

  const removeNotify = useCallback((id: string) => {
    setNotifiesState((prev) => prev.filter((notify) => notify._id !== id));
  }, []);

  const clearNotifies = useCallback(() => {
    setNotifiesState([]);
  }, []);

  return (
    <NotifyContext.Provider
      value={{ notifies, addOrUpdateNotify, removeNotify, clearNotifies }}
    >
      {children}
    </NotifyContext.Provider>
  );
};

export const useNotifyContext = (): NotifyContextData => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotifyContext must be used within a NotifyProvider");
  }
  return context;
};
