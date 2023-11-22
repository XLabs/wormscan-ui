import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ErrorGeneral from "src/components/organisms/SearchNotFound/ErrorGeneral";
import { BaseLayout } from "src/layouts/BaseLayout";

interface ErrorBoundaryProps {
  children: ReactNode;
  pathname: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  initialUrl: string;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, initialUrl: window.location.href };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

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
  const location = useLocation();
  return <ErrorBoundaryClass pathname={location.pathname}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
