import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
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
import UserEdit from "./pages/UserEdit/UserEdit";
import LogHistory from "./pages/LogHistory/LogHistory";
import AccountMenu from "./components/AccountMenu/AccountMenu";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import { ThemeProvider, useTheme } from "./theme/theme";
import GlobalStyle from "./GlobalStyles";
import SessionManager from "./components/SessionManager";
import { NotificationProvider } from './contexts/NotificationProvider';
import api from "./services/api";
import 'rsuite/dist/rsuite.min.css';

function AppWrapper() {
  const location = useLocation();
  const isLoggedIn = location.pathname !== "/";
  const { colors } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  const contentClass = [
    "app-content",
    screenWidth < 768
      ? isSidebarCollapsed ? "mobileClosed" : "mobileOpen"
      : isSidebarCollapsed ? "collapsed" : "expanded"
  ].join(" ");

  return (
    <div
      className="app-container"
      style={{
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

      <div className={contentClass}>
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
