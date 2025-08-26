// src/components/LeftSidebar/LeftSidebar.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LeftSidebar.module.css";
import api from "../../services/api";
import logo from "../../assets/logo.png";
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useTheme } from "../../theme/theme";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ModeNightIcon from '@mui/icons-material/ModeNight';

const LeftSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const [estoques, setEstoques] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function fetchProfileAndStocks() {
        try {
            const profileRes = await api.get("profile/");
            setUserProfile(profileRes.data);
            const userEstoqueIds = profileRes.data.estoques || [];
            if (userEstoqueIds.length > 0) {
                const stocksRes = await api.get("estoques/");
                const allStocks = stocksRes.data.results || stocksRes.data;
                const filteredStocks = allStocks.filter(stock => userEstoqueIds.includes(stock.id));
                setEstoques(filteredStocks.map(stock => ({ id: stock.id, nome: stock.nome || stock.name })));
            }
        } catch (error) {
            console.error("Erro ao buscar dados da sidebar:", error);
        }
    }
    fetchProfileAndStocks();
  }, []);

  const isAdmin = () => {
    if (!userProfile) return false;
    if (userProfile.is_superuser) return true;
    if (userProfile.groups && Array.isArray(userProfile.groups)) {
      return userProfile.groups.some((group) => group.name === "Administrador");
    }
    return false;
  };

  const handleNavigation = (path) => navigate(path);
  const isActive = (path) => (location.pathname.startsWith(path) ? styles.active : "");

  const sidebarClass = `${styles.sidebarContainer} ${ isSidebarOpen ? styles.expanded : styles.collapsed }`;

  return (
    <div className={sidebarClass}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
            <img src={logo} alt="Logo" className={!isSidebarOpen ? styles.logoCollapsed : styles.logo} />
        </div>
        {!isMobile && (
            <button className={styles.toggleButton} onClick={toggleSidebar}>
                {isSidebarOpen ? "«" : "☰"}
            </button>
        )}
      </div>
      <nav className={styles.nav}>
        <button className={`${styles.navItem} ${isActive("/dashboard")}`} onClick={() => handleNavigation("/dashboard")}>
            <DashboardIcon />
            <span className={styles.navText}>Dashboard</span>
        </button>
        {estoques.map((estoque) => (
          <button key={estoque.id} className={`${styles.navItem} ${isActive(`/estoque/${estoque.id}`)}`} onClick={() => handleNavigation(`/estoque/${estoque.id}`)}>
            <InventoryIcon />
            <span className={styles.navText}>{estoque.nome}</span>
          </button>
        ))}
        {isAdmin() && (
          <button className={`${styles.navItem} ${isActive("/logs")}`} onClick={() => handleNavigation("/logs")}>
            <AssessmentIcon />
            <span className={styles.navText}>Logs</span>
          </button>
        )}
        <button className={`${styles.navItem} ${isActive("/settings")}`} onClick={() => handleNavigation("/settings")}>
            <SettingsIcon />
            <span className={styles.navText}>Settings</span>
        </button>
      </nav>
      <div className={styles.themeToggleContainer}>
          <WbSunnyIcon className={styles.themeIcon} />
          <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
              <span className={styles.slider}></span>
          </label>
          <ModeNightIcon className={styles.themeIcon} />
      </div>
    </div>
  );
};

const isMobile = window.innerWidth < 768;
export default LeftSidebar;