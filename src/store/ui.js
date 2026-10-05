import { create } from "zustand";
export const useUiStore = create((set) => ({
  searchOpen: false, mobileMenuOpen: false, cartCount: 0,
  openSearch: () => set({ searchOpen: true }), closeSearch: () => set({ searchOpen: false }),
  toggleMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })), closeMenu: () => set({ mobileMenuOpen: false }),
  setCartCount: (cartCount) => set({ cartCount })
}));
