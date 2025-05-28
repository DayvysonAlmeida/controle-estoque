import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import SessionExpiryModal from "./SessionExpiryModal";

const SessionManager = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  // Tempo máximo de inatividade antes da expiração (em segundos)
  // Exemplo: 120 segundos em desenvolvimento; 300 segundos (5 minutos) em produção
  const idleTimeout = process.env.NODE_ENV === "development" ? 120 : 300;
  // Tempo de aviso: quando restarem 60 segundos, exibe o modal
  const warningTime = 60;

  // Função para atualizar a última atividade
  const resetActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Adiciona listeners de eventos para detectar atividade do usuário
  useEffect(() => {
    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("mousedown", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("scroll", resetActivity);

    return () => {
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("mousedown", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("scroll", resetActivity);
    };
  }, []);

  // Verificação periódica de inatividade (executado a cada 1 segundo)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      // Se não houver token, encerra o intervalo.
      if (!token) {
        clearInterval(intervalId);
        return;
      }

      const inactivityTime = (Date.now() - lastActivityRef.current) / 1000;
      const remain = idleTimeout - inactivityTime;
      setRemainingSeconds(remain > 0 ? Math.floor(remain) : 0);

      // Se o tempo restante for menor ou igual ao warningTime e maior que 0, exibe o modal
      if (remain <= warningTime && remain > 0 && !modalOpen) {
        console.log("Sessão prestes a expirar por inatividade, exibindo modal...");
        setModalOpen(true);
      }
      // Se o tempo restante voltar acima do warningTime e o modal estiver aberto, o fecha.
      else if (remain > warningTime && modalOpen) {
        console.log("Atividade detectada! Ocultando modal de expiração.");
        setModalOpen(false);
      }

      // Se o tempo de inatividade exceder o permitido, efetua o logout.
      if (remain <= 0) {
        clearInterval(intervalId);
        handleLogout();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [modalOpen, idleTimeout, warningTime]);

  // Função para renovar a sessão (chamando o endpoint de refresh)
  const handleRenewSession = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("Nenhum refreshToken encontrado. A sessão será encerrada.");
        handleLogout();
        return;
      }
      console.log("Tentando renovar a sessão...");
      const response = await api.post("token/refresh/", { refresh: refreshToken });
      if (response.data && response.data.access) {
        localStorage.setItem("accessToken", response.data.access);
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
        console.log("Sessão renovada com sucesso!");
        // Reseta o timer de inatividade
        lastActivityRef.current = Date.now();
        setRemainingSeconds(idleTimeout);
        setModalOpen(false);
      } else {
        console.error("Erro ao renovar a sessão: resposta inválida");
        handleLogout();
      }
    } catch (error) {
      console.error("Erro ao renovar a sessão:", error);
      handleLogout();
    }
  };

  // Função para efetuar logout – remove tokens, fecha modal e redireciona para a tela de login (rota "/")
  const handleLogout = () => {
    console.log("Logout acionado por inatividade.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setModalOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {children}
      {/* Renderiza o modal apenas se houver um token ativo e se não estivermos na tela de login */}
      {localStorage.getItem("accessToken") && location.pathname !== "/" && (
        <SessionExpiryModal
          open={modalOpen}
          remainingSeconds={remainingSeconds}
          onRenew={handleRenewSession}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default SessionManager;
