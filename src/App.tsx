import { QueryClient, QueryClientProvider } from "react-query";
import { Navigation } from "./navigation";

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
