// src/theme/ThemeProvider.js (ou dentro do seu ThemeProvider atual)
import React from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import theme from './theme';

export const ThemeProvider = ({ children }) => {
  return (
    <SCThemeProvider theme={theme}>
      {children}
    </SCThemeProvider>
  );
};

export default ThemeProvider;
