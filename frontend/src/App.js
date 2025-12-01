// src/App.js
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
import { ThemeProvider } from "./theme/theme";
import GlobalStyle from "./GlobalStyles";
// --- O QUE MUDOU: IMPORTAÇÕES RESTAURADAS ---
import SessionManager from "./components/SessionManager";
import { NotificationProvider } from './contexts/NotificationProvider';
import api from "./services/api";
import 'rsuite/dist/rsuite.min.css';
import './App.css';

// Hook customizado para detetar se a tela é de telemóvel
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

function AppWrapper() {
  const location = useLocation();
  const isLoggedIn = location.pathname !== "/";
  const isMobile = useIsMobile();

  // Lógica para o fundo da página de Login
  useEffect(() => {
    if (location.pathname === '/') {
      document.body.classList.add('login-active-background');
    }
    return () => {
      document.body.classList.remove('login-active-background');
    };
  }, [location.pathname]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      api.get("profile/").then(res => setProfile(res.data)).catch(err => console.error("Erro ao buscar perfil:", err));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const sidebarState = isMobile ? false : isSidebarOpen;

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const containerClass = isLoggedIn 
    ? (sidebarState ? 'sidebarExpanded' : 'sidebarCollapsed')
    : 'login-page';

  return (
    <div className={`appContainer ${containerClass}`}>
      {isLoggedIn && profile && (
        <>
          {isMobile && isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}
          <LeftSidebar
            isSidebarOpen={sidebarState}
            toggleSidebar={toggleSidebar}
          />
        </>
      )}

      <main className="contentWrapper">
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
      </main>
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