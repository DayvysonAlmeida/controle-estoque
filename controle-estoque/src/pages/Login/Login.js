// src/pages/Login/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./Login.module.css";
import logo from "../../assets/logo.png";
import { useNotification } from "../../contexts/NotificationProvider";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // O useEffect para mudar o fundo foi REMOVIDO. O CSS vai tratar disso.

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("token/", { username, password });
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      const profileResponse = await api.get("profile/");
      localStorage.setItem("userProfile", JSON.stringify(profileResponse.data));

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao realizar login.", error);
      showNotification("Utilizador ou senha incorretos.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo Controle Estoque" className={styles.logo} />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="username">Utilizador</label>
          <input
            type="text"
            id="username"
            placeholder="Digite o seu utilizador"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Digite a sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className={styles.passwordIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>
        </div>
        
        <button className={styles.submit} type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;