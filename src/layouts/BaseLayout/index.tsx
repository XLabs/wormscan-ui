import React from "react";
import { Footer, Header } from "src/components/molecules";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export { BaseLayout };
