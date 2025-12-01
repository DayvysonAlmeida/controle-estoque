// src/components/SessionManager.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import SessionExpiryModal from "./SessionExpiryModal/SessionExpiryModal"; // Caminho corrigido

const SessionManager = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  const idleTimeout = process.env.NODE_ENV === "development" ? 120 : 300;
  const warningTime = 30;

  const handleLogout = useCallback(() => {
    console.log("Logout acionado por inatividade.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setModalOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  const handleRenewSession = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleLogout();
        return;
      }
      const response = await api.post("token/refresh/", { refresh: refreshToken });
      if (response.data?.access) {
        localStorage.setItem("accessToken", response.data.access);
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
        lastActivityRef.current = Date.now();
        setModalOpen(false);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const resetActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ["mousemove", "mousedown", "keydown", "scroll"];
    events.forEach(event => window.addEventListener(event, resetActivity));
    return () => {
      events.forEach(event => window.removeEventListener(event, resetActivity));
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token || location.pathname === '/') {
        setModalOpen(false);
        clearInterval(intervalId);
        return;
      }

      const inactivityTime = (Date.now() - lastActivityRef.current) / 1000;
      const remain = idleTimeout - inactivityTime;
      
      if (remain <= 0) {
        clearInterval(intervalId);
        handleLogout();
      } else {
        setRemainingSeconds(Math.floor(remain));
        if (remain <= warningTime) {
          setModalOpen(true);
        } else {
          setModalOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [handleLogout, idleTimeout, warningTime, location.pathname]);

  return (
    <>
      {children}
      <SessionExpiryModal
        open={modalOpen}
        remainingSeconds={remainingSeconds}
        onRenew={handleRenewSession}
        onLogout={handleLogout}
        warningTime={warningTime}
      />
    </>
  );
};

export default SessionManager;