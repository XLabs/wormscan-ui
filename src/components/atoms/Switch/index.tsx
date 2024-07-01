import { Switch, Thumb } from "@radix-ui/react-switch";
import "./styles.scss";

type Props = {
  label?: string;
  showIndicator?: boolean;
  setValue?: (b: boolean) => void;
  value: boolean;
};

const SwitchComponent = ({ label, showIndicator = false, value, setValue = () => {} }: Props) => {
  return (
    <div className="switch">
      {label && (
        <div className="switch-label">
          {showIndicator && (
            <div className={`switch-label-indicator ${value ? "active" : ""}`}>
              <div className="switch-label-indicator-dot" />
            </div>
          )}
          <span>{label}</span>
        </div>
      )}

      <Switch className="switch-root" checked={value} onCheckedChange={setValue}>
        <Thumb className="switch-root-thumb" />
      </Switch>
    </div>
  );
};

export default SwitchComponent;
