import React from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";
import { Loader, BannerMessage } from "src/components/atoms";
import { Header, Footer } from "src/components/molecules";
import { loadPageState } from "src/utils/recoilStates";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  children: React.ReactNode;
  secondaryHeader?: boolean;
  showTopHeader?: boolean;
};

const BaseLayout = ({ children, secondaryHeader, showTopHeader = true }: Props) => {
  const { pathname } = useLocation();

  const [loadingPage] = useRecoilState(loadPageState);
  return (
    <>
      {pathname !== "/" && <BannerMessage />}
      <Header secondaryHeader={secondaryHeader} showTopHeader={showTopHeader} />
      <div className="main-content">{loadingPage ? <Loader /> : children}</div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export { BaseLayout };
