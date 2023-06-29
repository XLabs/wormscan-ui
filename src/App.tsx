import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { Navigation } from "./navigation";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default App;
