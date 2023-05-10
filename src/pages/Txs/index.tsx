import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";

const Txs = () => {
  return (
    <BaseLayout>
      <Top />
      <Information />
    </BaseLayout>
  );
};

export { Txs };
