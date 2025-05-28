import React, { useState, useEffect } from "react";
import { useTheme } from "../../theme/theme";
import styles from "./Profile.module.css";
import api from "../../services/api";
import { useNotification } from "../../contexts/NotificationProvider";

function Profile() {
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Estados para os dados do perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Busca os dados do perfil assim que o componente é montado
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("profile/");
        // Supondo que o objeto retornado contenha as propriedades "nome" e "email"
        setNome(response.data.nome);
        setEmail(response.data.email);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        showNotification("Erro ao buscar perfil.", "error");
        setLoading(false);
      }
    }
    fetchProfile();
  }, [showNotification]);

  // Função para tratar o envio do formulário e atualizar os dados do perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envia a atualização para o endpoint utilizando o método PUT.
      await api.put("profile/", { nome, email });
      showNotification("Perfil atualizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showNotification("Erro ao atualizar perfil.", "error");
    }
  };

  // Enquanto os dados estão sendo carregados, mostra uma mensagem ou loader
  if (loading) {
    return (
      <div
        className={styles.container}
        style={{ backgroundColor: colors.background, color: colors.text }}
      >
        Carregando...
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h1 className={styles.heading} style={{ color: colors.primary }}>
        Perfil do Usuário
      </h1>
      <p className={styles.text}>
        Aqui você pode visualizar e editar suas informações pessoais.
      </p>
      <form className={styles.content} onSubmit={handleSubmit}>
        <label className={styles.label}>Nome:</label>
        <input
          type="text"
          placeholder="Seu nome"
          className={styles.input}
          style={{ borderColor: colors.border }}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <label className={styles.label}>E-mail:</label>
        <input
          type="email"
          placeholder="Seu e-mail"
          className={styles.input}
          style={{ borderColor: colors.border }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className={styles.button}
          style={{
            backgroundColor: colors.primary,
            color: colors.buttonText,
          }}
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}

export default Profile;
