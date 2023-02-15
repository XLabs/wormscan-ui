import { QueryClient, QueryClientProvider } from "react-query";
import { Navigation } from "./navigation";
import WormScanSDK from "@xlabs-libs/wormscan-sdk";

export const wormscanClient = new WormScanSDK();

const App = () => {
  const queryClient = new QueryClient();

  return (
    <div id="root">
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </div>
  );
};

export default App;
