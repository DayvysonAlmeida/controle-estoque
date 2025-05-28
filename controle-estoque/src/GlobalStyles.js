// src/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Definindo variáveis CSS usando os tokens do tema */
  :root {
    --background: ${({ theme }) => theme.background};
    --text: ${({ theme }) => theme.text};
    --primary: ${({ theme }) => theme.primary};
    --border: ${({ theme }) => theme.border};
    --buttonText: ${({ theme }) => theme.buttonText};
    --btnprimarybg: ${({ theme }) => theme.btnprimarybg};
    --textprimary: ${({ theme }) => theme.textprimary};
    --linkColor: ${({ theme }) => theme.linkColor};
    --linkHoverColor: ${({ theme }) => theme.linkHoverColor};
  }

  /* Reset e estilos globais */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--background);
    color: var(--text);
    line-height: 1.6;
  }
`;

export default GlobalStyle;
