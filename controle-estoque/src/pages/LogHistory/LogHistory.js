// src/pages/LogHistory/LogHistory.js
import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import styles from "./LogHistory.module.css";
import { useNotification } from "../../contexts/NotificationProvider";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const LogHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  
  // --- LÓGICA DE PAGINAÇÃO ADICIONADA ---
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Começa com 10 por página

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/logs/");
        let data = response.data.results || response.data || [];
        if (!Array.isArray(data)) data = [];
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

  // --- LÓGICA DE PAGINAÇÃO ADICIONADA ---
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedLogs = useMemo(() => {
    return logs.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [logs, page, itemsPerPage]);


  if (loading) {
    return <div className={styles.container}><p>A carregar logs...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Histórico de Logs do Sistema</h2>
      {logs.length === 0 ? (
        <p>Nenhum log encontrado.</p>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Equipamento</th>
                  <th className={styles.th}>Utilizador</th>
                  <th className={styles.th}>Ação</th>
                  <th className={styles.th}>Data/Hora</th>
                  <th className={styles.th}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {/* --- USA OS LOGS PAGINADOS --- */}
                {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.td}>{log.equipamento}</td>
                    <td className={styles.td}>{log.usuario}</td>
                    <td className={styles.td}>{log.acao}</td>
                    <td className={styles.td}>{new Date(log.data_hora).toLocaleString()}</td>
                    <td className={styles.td}>{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- COMPONENTE DE PAGINAÇÃO ADICIONADO --- */}
          <Stack spacing={2} sx={{ marginTop: "20px", alignItems: "center" }}>
            <Pagination
              count={Math.ceil(logs.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
            <div className={styles.itemsPerPage}>
              <label htmlFor="itemsPerPage">Itens por página:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1); // Volta para a primeira página ao mudar o número de itens
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </Stack>
        </>
      )}
    </div>
  );
};

export default LogHistory;