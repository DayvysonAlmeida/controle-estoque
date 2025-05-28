import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import styles from "./Settings.module.css";

function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme, colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h1 className={styles.heading}>Configurações</h1>
      <p className={styles.subText}>Gerencie suas preferências.</p>
      <div className={styles.content}>
        <div className={styles.item}>
          <label className={styles.label}>
            Tema Atual: {theme === "light" ? "Claro" : "Escuro"}
          </label>
        </div>
        <button
          className={styles.button}
          style={{
            backgroundColor: colors.buttonBackground,
            color: colors.buttonText,
          }}
          onClick={toggleTheme}
        >
          Alternar para {theme === "light" ? "Escuro" : "Claro"}
        </button>
        <button
          className={styles.button}
          style={{
            backgroundColor: colors.primary,
            color: colors.buttonText,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
