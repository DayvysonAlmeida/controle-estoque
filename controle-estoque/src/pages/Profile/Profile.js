// src/pages/Profile/Profile.js
import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import api from "../../services/api";
import { useNotification } from "../../contexts/NotificationProvider";

function Profile() {
  const { showNotification } = useNotification();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("profile/");
        setNome(response.data.nome);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        showNotification("Erro ao buscar dados do perfil.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("profile/", { nome, email });
      showNotification("Perfil atualizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showNotification("Erro ao atualizar o perfil.", "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>O Meu Perfil</h2>
        <p className={styles.subheading}>Veja e edite as suas informações pessoais.</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="nome">Nome Completo</label>
          <input
            id="nome"
            type="text"
            placeholder="O seu nome"
            className={styles.input}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="O seu e-mail"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.button}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;