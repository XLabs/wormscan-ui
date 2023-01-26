import { createRoot } from "react-dom/client";

import "./globals.scss";
import App from "./App";

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
