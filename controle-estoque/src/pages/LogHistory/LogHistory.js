import React, { useEffect, useState } from "react";
import api from "../../services/api";
import styles from "./LogHistory.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const LogHistory = () => {
  // Cria o estado logs para armazenar os registros
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/logs/");
        let data = response.data;
        if (!Array.isArray(data)) {
          if (data.results && Array.isArray(data.results)) {
            data = data.results;
          } else {
            data = [];
          }
        }
        setLogs(data);
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
        showNotification("Erro ao buscar logs.", "error");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [showNotification]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Histórico de Logs</h1>
      {logs.length === 0 ? (
        <p>Nenhum log encontrado.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Data/Hora</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.equipamento}</td>
                <td>{log.usuario}</td>
                <td>{log.acao}</td>
                <td>{new Date(log.data_hora).toLocaleString()}</td>
                <td>{log.detalhes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LogHistory;
