import { QueryClient, QueryClientProvider } from "react-query";
import { Navigation } from "./navigation";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
};

export default App;
