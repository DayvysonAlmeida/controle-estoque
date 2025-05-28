import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./Login.module.css";
import logo from "../../assets/logo.png";
import { useNotification } from "../../contexts/NotificationProvider";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Realiza o login e obtém os tokens
      const response = await api.post("token/", { username, password });
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      // Requisição para obter os dados do usuário
      const profileResponse = await api.get("profile/");
      localStorage.setItem("userProfile", JSON.stringify(profileResponse.data));

      // Redireciona para o dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao realizar login.", error);
      showNotification("Usuário ou senha incorretos.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo Controle Estoque" className={styles.logo} />
        </div>
        {/* Agora o feedback é global, então não é necessário exibir uma mensagem local */}
        <div className={styles.inputGroup}>
          <label htmlFor="username">Usuário</label>
          <input
            type="text"
            id="username"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className={styles.submit} type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
