import { createRoot } from "react-dom/client";

import "./index.scss";
import "./styles/globals.scss";
import "./i18n";
import App from "./App";
window.devicePixelRatio = 1; // To handle poor performance on high resolution screens

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
