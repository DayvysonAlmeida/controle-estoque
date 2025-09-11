// src/components/LeftSidebar/LeftSidebar.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import styles from "./LeftSidebar.module.css";
import api from "../../services/api";
import logo from "../../assets/logo.png";

const LeftSidebar = ({ onSelectStock, isCollapsed, toggleSidebar }) => {
  const [estoques, setEstoques] = useState([]);
  const [userEstoqueIds, setUserEstoqueIds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();

  // Detecta mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) toggleSidebar(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [toggleSidebar]);

  // Busca perfil do usuário
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await api.get("profile/");
        setUserProfile(response.data);
        setUserEstoqueIds(response.data.estoques || []);
      } catch (error) {
        console.error("Erro ao buscar o perfil do usuário:", error);
      }
    }
    fetchUserProfile();
  }, []);

  // Busca estoques filtrados pelo perfil
  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await api.get("estoques/");
        const allStocks = response.data.results || response.data;
        const filteredStocks = allStocks.filter((stock) =>
          userEstoqueIds.includes(stock.id)
        );
        setEstoques(
          filteredStocks.map((stock) => ({
            id: stock.id,
            nome: stock.nome || stock.name,
            descricao: stock.descricao,
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar estoques:", error);
      }
    }
    if (userEstoqueIds.length > 0) fetchStocks();
  }, [userEstoqueIds]);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) toggleSidebar();
  };

  const isActive = (path) => (location.pathname === path ? styles.active : "");

  // Determina classes CSS
  const sidebarClass = [
    styles.sidebarContainer,
    isCollapsed ? styles.collapsed : styles.expanded,
    isMobile ? (isCollapsed ? styles.mobileClosed : styles.mobileOpen) : "",
  ].join(" ");

  return (
    <div
      className={sidebarClass}
      style={{
        backgroundColor: colors.sidebarBg || "#413e40",
        color: colors.sidebarText || "#ecf0f1",
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img
            src={logo}
            alt="Logo"
            className={isCollapsed ? styles.logoCollapsed : styles.logo}
          />
        </div>
        <div className={styles.headerRight}>
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            {isCollapsed ? "☰" : "«"}
          </button>
        </div>
      </div>

      {/* Navegação */}
      {(!isCollapsed || isMobile) && (
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${isActive("/dashboard")}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            Dashboard
          </button>

          {estoques.map((estoque) => (
            <button
              key={estoque.id}
              className={`${styles.navItem} ${
                location.pathname === `/estoque/${estoque.id}` ? styles.active : ""
              }`}
              onClick={() => {
                if (onSelectStock) onSelectStock(estoque.id);
                handleNavigation(`/estoque/${estoque.id}`);
              }}
            >
              {estoque.nome}
            </button>
          ))}

          {userProfile && userProfile.role === "admin" && (
            <button
              className={`${styles.navItem} ${isActive("/logs")}`}
              onClick={() => handleNavigation("/logs")}
            >
              Logs
            </button>
          )}

          <button
            className={`${styles.navItem} ${isActive("/settings")}`}
            onClick={() => handleNavigation("/settings")}
          >
            Settings
          </button>
        </nav>
      )}
    </div>
  );
};

export default LeftSidebar;
