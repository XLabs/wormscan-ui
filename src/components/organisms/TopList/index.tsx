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
    name?: string;
    ariaLabel?: string;
    className?: string;
  };
  value: any;
  onValueChange: (value: any) => void;
};

const TopList = ({ title, subtitle, children, filterOptions, value, onValueChange }: Props) => {
  const { name, items, ariaLabel, className } = filterOptions;

  return (
    <div className="top-list" data-testid="top-list">
      <div className="top-list-header">
        <div className="top-list-title-container">
          <h3 className="top-list-title">{title}</h3>
          <Select
            name={name}
            value={value}
            onValueChange={(value: any) => onValueChange(value)}
            items={items}
            ariaLabel={ariaLabel}
            className={className}
          />
        </div>
        <h4 className="top-list-subtitle">{subtitle}</h4>
      </div>
      <div className="top-list-body">{children}</div>
    </div>
  );
};

export default TopList;
