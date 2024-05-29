import { CheckIcon } from "src/icons/generic";
import "./styles.scss";

type Props = {
  checked: boolean;
};

const Checkbox = ({ checked }: Props) => {
  return (
    <div className={`custom-checkbox ${checked ? "checked" : ""}`}>
      {checked && <CheckIcon width={20} />}
    </div>
  );
};

export default Checkbox;
