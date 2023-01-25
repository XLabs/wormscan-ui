import "./App.scss";
import { CrossChainChart, Header } from "./components/molecules";

const App = () => {
  return (
    <div id="root">
      <Header />
      <CrossChainChart />
    </div>
  );
};

export default App;
