import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { Navigation } from "./navigation";

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default App;
