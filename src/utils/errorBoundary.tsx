import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorGeneral from "src/components/organisms/SearchNotFound/ErrorGeneral";
import { BaseLayout } from "src/layouts/BaseLayout";

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const errorHandler = () => {
      setHasError(true);
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  useEffect(() => {
    if (hasError) {
      setHasError(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (hasError) {
    return (
      <BaseLayout>
        <ErrorGeneral />
      </BaseLayout>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
