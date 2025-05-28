// src/theme/theme.js
import { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider as SCThemeProvider } from "styled-components"; // Importa o ThemeProvider do styled-components

const ThemeContext = createContext();

/*
  Este ThemeProvider controla o tema (light ou dark) e fornece um objeto "colors"
  com os tokens de cor para cada modo, além de encapsular os filhos com o SCThemeProvider,
  permitindo que o createGlobalStyle (e styled-components em geral) acessem o objeto de tema.
*/
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const colors =
    theme === "light"
      ? {
          // Light Theme
          background: "#f9f9f9",
          text: "#333333",
          primary: "#58bc82",
          secondary: "#666e9a",
          border: "#e0e0e0",
          buttonBackground: "#58bc82",
          buttonText: "#ffffff",
          hoverBackground: "#2878a4",
          headingColor: "#333333",
          labelColor: "#58bc82",
          focusBorder: "#58bc82",
          linkColor: "#58bc82",
          linkHoverColor: "#45a56b",
          buttonHover: "#45a56b",
          signupText: "#333333",
  
          bgcard: "#FFFFFF",
          bgprimary: "#F9FAFB",
          bordercolor: "#E5E7EB",
          textprimary: "#111827",
          textsecondary: "#6B7280",
  
          btnprimarybg: "#2563EB",
          btnprimaryhover: "#1D4ED8",
          btnprimarytext: "#FFFFFF",
  
          btnsecondarybg: "#E5E7EB",
          btnsecondaryhover: "#D1D5DB",
          btnsecondarytext: "#111827",
  
          menubg: "#FFFFFF",
          menuborder: "#D1D5DB",
          menuactive: "#2563EB",
  
          chartcolor1: "#3B82F6",
          chartcolor2: "#10B981",
          chartcolor3: "#F59E0B",
          chartcolor4: "#EF4444",
          chartcolor5: "#8B5CF6",
        }
      : {
          // Dark Theme
          background: "#282c34",
          text: "#FFFFFF",
          primary: "#009929",
          secondary: "#E76F00",
          border: "#444444",
          buttonBackground: "#006414",
          buttonText: "#ffffff",
          hoverBackground: "#005f99",
          headingColor: "#F9FAFB",
          labelColor: "#54C241",
          focusBorder: "#54C241",
          linkColor: "#54C241",
          linkHoverColor: "#3B7D2B",
          buttonHover: "#45a56b", // Ajuste conforme desejado
          signupText: "#FFF",
  
          bgprimary: "#111827",
          bgcard: "#1F2937",
          bordercolor: "#374151",
          textprimary: "#F9FAFB",
          textsecondary: "#9CA3AF",
  
          btnprimarybg: "#5ccb5f",
          btnprimaryhover: "#2563EB",
          btnprimarytext: "#FFFFFF",
  
          btnsecondarybg: "#374151",
          btnsecondaryhover: "#4B5563",
          btnsecondarytext: "#F9FAFB",
  
          menubg: "#1F2937",
          menuborder: "#374151",
          menuactive: "#3B82F6",
  
          chartcolor1: "#3B82F6",
          chartcolor2: "#10B981",
          chartcolor3: "#F59E0B",
          chartcolor4: "#EF4444",
          chartcolor5: "#8B5CF6",
        };

  // Atualiza as custom properties do CSS se desejar (opcional)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--text", colors.text);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--buttonText", colors.buttonText);
    // Adicione outras propriedades conforme necessário...
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <SCThemeProvider theme={colors}>
        {children}
      </SCThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
