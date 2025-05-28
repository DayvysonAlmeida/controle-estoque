// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import EquipmentList from "./pages/EquipmentList/EquipmentList";
import EquipmentForm from "./pages/EquipmentForm/EquipmentForm";
import EquipmentHistory from "./pages/EquipmentHistory/EquipmentHistory";
import UserManagement from "./pages/UserManagement/UserManagement";
import EquipmentEdit from "./pages/EquipmentEdit/EquipmentEdit";
import UserForm from "./pages/UserForm/UserForm";
import AccountMenu from "./components/AccountMenu/AccountMenu";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import LogHistory from "./pages/LogHistory/LogHistory";
import { ThemeProvider, useTheme } from "./theme/theme";
import api from "./services/api";
import GlobalStyle from "./GlobalStyles"; // Global styles unificados
import SessionManager from "./components/SessionManager"; // Gerência de expiração de sessão
import 'rsuite/dist/rsuite.min.css';
import UserEdit from "./pages/UserEdit/UserEdit";
import { NotificationProvider } from './contexts/NotificationProvider';

function AppWrapper() {
  const location = useLocation();
  const isLoggedIn = location.pathname !== "/";
  const { colors } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Atualiza screenWidth ao redimensionar a janela
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("profile/");
        setProfile(res.data);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    }
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  // Cálculo da margem do conteúdo principal
  let contentMargin = "0px";
  if (isLoggedIn) {
    if (screenWidth >= 768) {
      // Em desktop: 200px se aberto, 60px se recolhido
      contentMargin = isSidebarCollapsed ? "60px" : "200px";
    } else {
      // Em mobile: se o sidebar estiver aberto, calcula a margem conforme a largura definida (70% da tela, com máximo 300px)
      contentMargin = isSidebarCollapsed
        ? "0px"
        : `${Math.min(screenWidth * 0.7, 300)}px`;
    }
  }

  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      {isLoggedIn && profile && (
        <LeftSidebar
          estoques={profile.estoques || []}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      <div
        className="app-content"
        style={{
          flex: 1,
          marginLeft: contentMargin,
          padding: "50px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {isLoggedIn && <AccountMenu />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/estoque/:estoqueId" element={<EquipmentList />} />
          <Route path="/estoque/:estoqueId/novo-equipamento" element={<EquipmentForm />} />
          <Route path="/equipamento/:equipamentoId" element={<EquipmentHistory />} />
          <Route path="/usuarios" element={<UserManagement />} />
          <Route path="/usuarios/novo" element={<UserForm />} />
          <Route path="/equipamento/:id/editar" element={<EquipmentEdit />} />
          <Route path="/usuarios/:userId/editar" element={<UserEdit />} />
          <Route path="/logs" element={<LogHistory />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <Router>
        <SessionManager>
          <NotificationProvider>
            <AppWrapper />
          </NotificationProvider>
        </SessionManager>
      </Router>
    </ThemeProvider>
  );
}

export default App;
