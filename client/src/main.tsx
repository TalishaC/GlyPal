import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("GlyPal: Application starting");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element #root not found in DOM!");
  }
  
  console.log("GlyPal: Root element found, rendering app");
  createRoot(rootElement).render(<App />);
  console.log("GlyPal: App rendered successfully");
} catch (error) {
  console.error("GlyPal FATAL ERROR:", error);
  document.body.innerHTML = `
    <div style="max-width: 600px; margin: 50px auto; padding: 20px; font-family: system-ui; background: #fee; border: 2px solid #c33; border-radius: 8px;">
      <h1 style="color: #c33; margin: 0 0 10px 0;">⚠️ Application Failed to Start</h1>
      <p style="margin: 10px 0;"><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
      <details style="margin-top: 20px;">
        <summary style="cursor: pointer; font-weight: bold;">Stack Trace</summary>
        <pre style="background: white; padding: 10px; overflow: auto; font-size: 12px; margin-top: 10px;">${error instanceof Error ? error.stack : 'No stack trace available'}</pre>
      </details>
    </div>
  `;
}
