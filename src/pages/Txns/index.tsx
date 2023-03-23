import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";

const Txns = () => {
  return (
    <BaseLayout>
      <Top />
      <Information />
    </BaseLayout>
  );
};

export { Txns };
