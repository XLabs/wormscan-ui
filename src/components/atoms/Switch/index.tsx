import { Switch, Thumb } from "@radix-ui/react-switch";
import "./styles.scss";

type Props = {
  label?: string;
  setValue?: (b: boolean) => void;
  value: boolean;
};

const SwitchComponent = ({ label, value, setValue = () => {} }: Props) => {
  return (
    <div className="switch">
      <Switch className={"switch-container"} checked={value} onCheckedChange={setValue}>
        <Thumb className={`switch-thumb ${value ? "on" : "off"}`} />
      </Switch>

      <span className={`switch-label ${value ? "on" : "off"}`}>{label}</span>
    </div>
  );
};

export default SwitchComponent;
