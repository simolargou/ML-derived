import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
const FocusContext = createContext<{
  focused: string | null;
  setFocused: (symbol: string | null) => void;
} | null>(null);
export function ParameterFocus({ children }: { children: ReactNode }) {
  const [focused, setFocused] = useState<string | null>(null);
  return <FocusContext.Provider value={{ focused, setFocused }}>{children}</FocusContext.Provider>;
}
export const useParameterFocus = () => useContext(FocusContext);
