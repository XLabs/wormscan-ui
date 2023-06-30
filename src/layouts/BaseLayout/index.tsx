import React from "react";
import { useSearchParams } from "react-router-dom";
import { isOfTypeNetwork } from "src/api/Client";
import { Header, Footer } from "src/components/molecules";
import { NETWORK } from "../../types";

type Props = {
  children: React.ReactNode;
};

const BaseLayout = ({ children }: Props) => {
  const [searchParams] = useSearchParams();
  let network = searchParams.get("network") as NETWORK;

  if (!isOfTypeNetwork(network)) {
    network = "mainnet";
  }

  return (
    <>
      <Header network={network} />
      <div className="main-content">{children}</div>
      <Footer />
    </>
  );
};

export { BaseLayout };
