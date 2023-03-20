import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "src/pages/Home";
import { Txns } from "src/pages/Txns";

type Props = {};

const Navigation = (props: Props) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/txns" element={<Txns />} />
      </Routes>
    </Router>
  );
};

export { Navigation };
