import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Home } from "src/pages/Home";

type Props = {};

const Navigation = (props: Props) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export { Navigation };
