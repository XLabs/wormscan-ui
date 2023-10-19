import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { EnvironmentProvider } from "src/context/EnvironmentContext";
import { ScrollControl } from "src/utils/scrollControl";

const Home = lazy(() => import("../pages/Home"));
const Tx = lazy(() => import("../pages/Tx"));
const Txs = lazy(() => import("../pages/Txs"));
const NotFound = lazy(() => import("../pages/NotFound"));
const SearchNotFound = lazy(() => import("../pages/SearchNotFound"));

const AllRoutes2 = () => {
  // if the user moves, remove the attemptsMade
  localStorage.removeItem("attemptsMade");

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/txs" element={<Txs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AllRoutes = () => {
  // we need this because if we close the /search-not-found page we keep the reloadRedirect
  // and we redirect to a bad url if we search for a bad tx
  localStorage.removeItem("reloadRedirect");

  return (
    <Routes>
      <Route path="/tx/:txHash" element={<Tx />} />
      <Route path="/tx/:chainId/:emitter/:seq" element={<Tx />} />
      <Route path="/*" element={<AllRoutes2 />} />
    </Routes>
  );
};

const Navigation = () => {
  return (
    <Router>
      <ScrollControl />
      <EnvironmentProvider>
        <Suspense
          fallback={
            <BaseLayout>
              <Loader />
            </BaseLayout>
          }
        >
          <Routes>
            <Route path="/search-not-found" element={<SearchNotFound />} />
            <Route path="/*" element={<AllRoutes />} />
          </Routes>
        </Suspense>
      </EnvironmentProvider>
    </Router>
  );
};

export { Navigation };
