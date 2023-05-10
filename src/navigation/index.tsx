import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "src/pages/Home";
import { Tx } from "src/pages/Tx";
import { Txs } from "src/pages/Txs";

type Props = {};

const Navigation = (props: Props) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/txs" element={<Txs />} />
        <Route path="/tx" element={<Tx />} />
      </Routes>
    </Router>
  );
};

export { Navigation };
