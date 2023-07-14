import React, { ReactNode, useCallback, useContext, useMemo, useState } from "react";

export type Log = {
  value: string;
  type?: "error" | "info" | "success" | undefined;
  context?: string;
};
interface LoggerContext {
  log: (value: string, context?: string, type?: "error" | "info" | "success" | undefined) => void;
  clear: () => void;
  logs: Log[];
}

const LoggerProviderContext = React.createContext<LoggerContext>({
  log: (value: string, context?: string, type?: "error" | "info" | "success" | undefined) => {},
  clear: () => {},
  logs: [],
});

export const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<Log[]>([
    { value: "Instantiated the logger.", type: "info", context: "Logger" },
  ]);
  const clear = useCallback(() => setLogs([]), [setLogs]);

  const log = useCallback(
    (value: string, context?: string, type?: "error" | "info" | "success" | undefined) => {
      const newLog = { value, type, context };
      setLogs((logs: any) => [...logs, newLog]);
      if (type === "error") {
        console.error(value);
      } else if (type === "success") {
        console.log(value);
      } else if (type === "info") {
        console.log(value);
      } else {
        console.log(value);
      }
    },
    [setLogs],
  );

  const contextValue = useMemo(
    () => ({
      logs,
      clear,
      log,
    }),
    [logs, clear, log],
  );
  return (
    <LoggerProviderContext.Provider value={contextValue}>{children}</LoggerProviderContext.Provider>
  );
};
export const useLogger = () => {
  return useContext(LoggerProviderContext);
};
