import "./styles.scss";

type Props = {
  children: React.ReactNode;
};

const Counter = ({ children }: Props) => {
  return <div className="counter">{children}</div>;
};

export default Counter;
