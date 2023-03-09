import "./styles.scss";

type Props = {
  children: React.ReactNode;
};

const MainContent = ({ children }: Props) => {
  return <div className="main-content">{children}</div>;
};

export default MainContent;
