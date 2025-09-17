import { create } from "zustand";

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  // default to dark
  return "dark";
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (newTheme) => {
    const theme = newTheme === "light" ? "light" : "dark";
    // persist
    localStorage.setItem("theme", theme);
    // apply to document
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));

// Apply theme immediately on first import
(() => {
  const theme = getInitialTheme();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
})();


