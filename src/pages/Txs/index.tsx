import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";

const Txs = () => {
  return (
    <BaseLayout>
      <div className="txs-page">
        <Top />
        <Information />
      </div>
    </BaseLayout>
  );
};

export { Txs };
