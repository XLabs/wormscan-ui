import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorGeneral from "src/components/organisms/SearchNotFound/ErrorGeneral";
import { BaseLayout } from "src/layouts/BaseLayout";

interface ErrorBoundaryProps {
  children: ReactNode;
  pathname: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // if an error occurs, set hasError to true, show the error <ErrorGeneral />
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // if the pathname changes, reset hasError to false, show the child content
  componentDidUpdate(prevProps: { pathname: string }) {
    if (this.props.pathname !== prevProps.pathname) {
      if (this.state.hasError) {
        this.setState({ hasError: false });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <BaseLayout>
          <ErrorGeneral />
        </BaseLayout>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const { pathname } = useLocation();

  // if an error occurs, set hasError to true, show the error <ErrorGeneral />
  useEffect(() => {
    const errorHandler = () => {
      setHasError(true);
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  // if the pathname changes, reset hasError to false, show the child content
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

  return <ErrorBoundaryClass pathname={pathname}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
