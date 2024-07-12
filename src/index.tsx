import { createRoot } from "react-dom/client";

import "./index.scss";
import "./styles/globals.scss";
import "./i18n";
import App from "./App";
import "@wormhole-foundation/sdk/addresses";

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
