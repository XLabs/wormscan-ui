import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "src/components/atoms";
import { BaseLayout } from "src/layouts/BaseLayout";
import { EnvironmentProvider } from "src/context/EnvironmentContext";
import { AnalyticsLinkTracker } from "src/utils/analyticsLinkTracker";
import ErrorBoundary from "src/utils/errorBoundary";

const Home = lazy(() => import("../pages/Home"));
const Tx = lazy(() => import("../pages/Tx"));
const Txs = lazy(() => import("../pages/Txs"));
const TermsOfUse = lazy(() => import("../pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const NotFound = lazy(() => import("../pages/NotFound"));
const VaaParser = lazy(() => import("../pages/VaaParser"));
const Submit = lazy(() => import("../pages/Submit"));
const Governor = lazy(() => import("../pages/Governor"));
const Analytics = lazy(() => import("../pages/Analytics"));
const ApiDoc = lazy(() => import("../pages/ApiDoc"));

const Navigation = () => {
  return (
    <Router>
      <AnalyticsLinkTracker>
        <EnvironmentProvider>
          <ErrorBoundary>
            <Suspense
              fallback={
                <BaseLayout>
                  <Loader />
                </BaseLayout>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/txs" element={<Txs />} />
                <Route path="/tx/:txHash" element={<Tx />} />
                <Route path="/tx/:chainId/:emitter/:seq" element={<Tx />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/developers/submit" element={<Submit />} />
                <Route path="/developers/submit/*" element={<Submit />} />
                <Route path="/developers/vaa-parser" element={<VaaParser />} />
                <Route path="/developers/vaa-parser/*" element={<VaaParser />} />
                <Route path="/developers/api-doc" element={<ApiDoc />} />
                <Route path="/analytics/:analyticsId" element={<Analytics />} />
                <Route path="/governor" element={<Governor />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </EnvironmentProvider>
      </AnalyticsLinkTracker>
    </Router>
  );
};

export { Navigation };
