import { CheckIcon, MinusIcon } from "src/icons/generic";
import "./styles.scss";

type Props = {
  checked: boolean;
  locked?: boolean;
};

const Checkbox = ({ checked, locked }: Props) => {
  if (locked) {
    return (
      <div className="custom-checkbox checked">
        <MinusIcon width={20} />
      </div>
    );
  }

  return (
    <div className={`custom-checkbox ${checked ? "checked" : ""}`}>
      {checked && <CheckIcon width={20} />}
    </div>
  );
};

export default Checkbox;
