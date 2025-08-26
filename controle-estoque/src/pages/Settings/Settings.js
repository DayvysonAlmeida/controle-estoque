// src/pages/Settings/Settings.js
import React from "react";
import styles from "./Settings.module.css";
import { useTheme } from "../../theme/theme";

function Settings() {
  const { theme } = useTheme();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Configurações</h2>
        <p className={styles.subheading}>Ajuste as suas preferências da aplicação.</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.labelText}>Perfil</span>
            <span className={styles.labelValue}>Edite as suas informações pessoais.</span>
          </div>
          {/* Pode adicionar um botão aqui no futuro para ir para a página de perfil */}
        </div>
        
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.labelText}>Tema Visual</span>
            <span className={styles.labelValue}>
              O controlo do tema está agora na barra lateral. O tema atual é: <strong>{theme === "light" ? "Claro" : "Escuro"}</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;