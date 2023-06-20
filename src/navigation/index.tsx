import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "src/pages/Home";
import { Tx } from "src/pages/Tx";
import { Txs } from "src/pages/Txs";
import { NotFound } from "src/pages/NotFound";
import { SearchNotFound } from "src/pages/SearchNotFound";

const Navigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/txs" element={<Txs />} />
        <Route path="/tx/:txHash" element={<Tx />} />
        <Route path="/search-not-found" element={<SearchNotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export { Navigation };
