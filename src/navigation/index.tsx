import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import RelayerDashboard from "../pages/RelayerDashboard/Dashboard";
import RelayerContractStates from "../pages/RelayerDashboard/RelayerContractStates";

const Home = lazy(() => import("../pages/Home"));
const Tx = lazy(() => import("../pages/Tx"));
const Txs = lazy(() => import("../pages/Txs"));
const NotFound = lazy(() => import("../pages/NotFound"));
const SearchNotFound = lazy(() => import("../pages/SearchNotFound"));

const Navigation = () => {
  return (
    <Router>
      <Suspense
        fallback={
          <BaseLayout>
            <Loader />
          </BaseLayout>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/relayer-dashboard" element={<RelayerDashboard />} />
          <Route path="/contract-states" element={<RelayerContractStates />} />
          <Route path="/txs" element={<Txs />} />
          <Route path="/tx/:txHash" element={<Tx />} />
          <Route path="/search-not-found" element={<SearchNotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export { Navigation };
