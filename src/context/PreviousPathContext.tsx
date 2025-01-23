import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PreviousPathContextProps {
  prevPath: string | null;
}

const PreviousPathContext = createContext<PreviousPathContextProps | undefined>(undefined);

export const PreviousPathProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    prevPathRef.current = currentPath;
  }, [location]);

  return (
    <PreviousPathContext.Provider value={{ prevPath: prevPathRef.current }}>
      {children}
    </PreviousPathContext.Provider>
  );
};

export const usePreviousPath = (): PreviousPathContextProps => {
  return useContext(PreviousPathContext);
};
