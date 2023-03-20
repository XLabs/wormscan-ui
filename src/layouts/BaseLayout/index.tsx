import React from "react";
import { Header, Footer } from "src/components/molecules";
import { JoinUs } from "src/components/molecules";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <div className="main-content">{children}</div>
      <JoinUs />
      <Footer />
    </>
  );
};

export { BaseLayout };
