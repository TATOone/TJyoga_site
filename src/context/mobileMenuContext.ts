import { createContext } from 'react';

export interface MobileMenuContextValue {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const MobileMenuContext = createContext<MobileMenuContextValue>({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
});
