import { createContext, useEffect, useState } from "react";

export const DarkModeContext = createContext();

export const DarkmodeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <DarkModeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </DarkModeContext.Provider>
  );
};
