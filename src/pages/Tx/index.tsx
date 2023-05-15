import { BaseLayout } from "src/layouts/BaseLayout";
import { Information } from "./Information";
import { Top } from "./Top";

const Tx = () => {
  return (
    <BaseLayout>
      <Top />
      <Information />
    </BaseLayout>
  );
};

export { Tx };
