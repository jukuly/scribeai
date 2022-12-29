import { AppDefault } from "./default/appDefault";
import { AppMinimized } from "./minimized/appMinimized";

export function App() {
  const minimized = true;
  return minimized ? 
    <AppMinimized />
    : <AppDefault />
}