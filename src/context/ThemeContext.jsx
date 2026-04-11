import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem("eduplay_tema") || "claro";
  });

  useEffect(() => {
    localStorage.setItem("eduplay_tema", tema);
    document.documentElement.setAttribute("data-tema", tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((prev) => (prev === "claro" ? "escuro" : "claro"));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}

