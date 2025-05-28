import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import styles from "./LeftSidebar.module.css";
import api from "../../services/api";
import logo from "../../assets/logo.png"; 

const LeftSidebar = ({ onSelectStock, isCollapsed, toggleSidebar }) => {
  const [estoques, setEstoques] = useState([]);
  const [userEstoqueIds, setUserEstoqueIds] = useState([]);
  // Novo estado para armazenar o perfil completo do usuário
  const [userProfile, setUserProfile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();

  // Atualiza se a tela é mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) toggleSidebar(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [toggleSidebar]);

  // Buscar perfil do usuário e salvar o perfil completo
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

  // Buscar estoques e filtrar conforme perfil do usuário
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
    if (isMobile) toggleSidebar(true);
  };

  const isActive = (path) => location.pathname === path ? styles.active : "";

  return (
    <div
      className={styles.sidebarContainer}
      style={{
        backgroundColor: colors.sidebarBg || "#413e40",
        color: colors.sidebarText || "#ecf0f1",
        width: isCollapsed ? "60px" : "200px",
        overflowY: isCollapsed && !isMobile ? "hidden" : "auto",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        className={styles.header}
        style={{
          flexDirection: isCollapsed ? "column" : "row",
          alignItems: isCollapsed ? "flex-start" : "center",
          padding: "10px 15px",
        }}
      >
        <div className={styles.headerLeft}>
          {isCollapsed ? (
            <img src={logo} alt="Logo" className={styles.logoCollapsed} />
          ) : (
            <img src={logo} alt="Logo Controle Estoque" className={styles.logo} />
          )}
        </div>
        <div
          className={styles.headerRight}
          style={{
            marginTop: isCollapsed ? "5px" : "0",
            alignSelf: isCollapsed ? "stretch" : "center",
          }}
        >
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            {isCollapsed ? "☰" : "«"}
          </button>
        </div>
      </div>

      {/* Menu de navegação */}
      {!isCollapsed && (
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${isActive("/dashboard")}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            Dashboard
          </button>

          {estoques &&
            estoques.map((estoque) => (
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

          {/* Botão adicional apenas para administradores */}
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
