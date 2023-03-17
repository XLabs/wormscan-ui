import { Select } from "src/components/atoms";
import "./styles.scss";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  filterOptions: {
    items: {
      label: string;
      value: string;
    }[];
    ariaLabel?: string;
    className?: string;
  };
  value: string;
  onValueChange: (value: string) => void;
};

const TopList = ({ title, subtitle, children, filterOptions, value, onValueChange }: Props) => {
  const { items, ariaLabel, className } = filterOptions;

  return (
    <div className="top-list">
      <div className="top-list-header">
        <div className="top-list-texts">
          <h3 className="top-list-title">{title}</h3>
          <h4 className="top-list-subtitle">{subtitle}</h4>
        </div>

        <Select
          value={value}
          onValueChange={value => onValueChange(value)}
          items={items}
          ariaLabel={ariaLabel}
          className={className}
          style={{ width: "fit-content" }}
        />
      </div>
      <div className="top-list-body">{children}</div>
    </div>
  );
};

export default TopList;
