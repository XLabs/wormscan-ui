import React from "react";
import { Header, Footer } from "src/components/molecules";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <div className="bg-gradient-top" />
      <div className="bg-gradient-bottom" />
      <Header />
      <div className="main-content">{children}</div>
      <Footer />
    </>
  );
};

export { BaseLayout };
