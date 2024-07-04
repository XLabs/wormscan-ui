import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilState } from "recoil";
import { Loader, MaintenanceMessage } from "src/components/atoms";
import { Header, Footer } from "src/components/molecules";
import { loadPageState } from "src/utils/recoilStates";

type Props = {
  children: React.ReactNode;
  secondaryHeader?: boolean;
};

const BaseLayout = ({ children, secondaryHeader }: Props) => {
  const [loadingPage] = useRecoilState(loadPageState);
  return (
    <>
      <MaintenanceMessage />
      <Header secondaryHeader={secondaryHeader} />
      <div className="main-content">{loadingPage ? <Loader /> : children}</div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export { BaseLayout };
