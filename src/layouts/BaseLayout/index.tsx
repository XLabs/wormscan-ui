import React from "react";
import { useRecoilState } from "recoil";
import { Loader } from "src/components/atoms";
import { Header, Footer } from "src/components/molecules";
import { loadPageState } from "src/utils/recoilStates";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  const [loadingPage] = useRecoilState(loadPageState);
  return (
    <>
      <Header />
      <div className="main-content">{loadingPage ? <Loader /> : children}</div>
      <Footer />
      <div className="bg-gradient-top" />
      <div className="bg-gradient-bottom" />
    </>
  );
};

export { BaseLayout };
