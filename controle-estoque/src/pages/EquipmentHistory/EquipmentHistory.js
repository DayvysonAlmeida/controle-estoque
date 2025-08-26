// src/pages/EquipmentHistory/EquipmentHistory.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EquipmentHistory.module.css";

const EquipmentHistory = () => {
  const { equipamentoId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [equipmentRes, historyRes] = await Promise.all([
          api.get(`equipments/${equipamentoId}/`),
          api.get("equipment-history/", { params: { equipment: equipamentoId } })
        ]);
        
        setEquipment(equipmentRes.data);

        const historyData = historyRes.data.results || historyRes.data;
        if (Array.isArray(historyData)) {
            historyData.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
        }
        setHistory(Array.isArray(historyData) ? historyData : []);

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Erro ao carregar os dados");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [equipamentoId]);

  if (loading) {
    return <div className={styles.container}><p>A carregar dados do equipamento...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p>{error}</p></div>;
  }

  return (
    <div className={styles.container}>
      {equipment && (
        <div className={styles.detailsCard}>
          <h2 className={styles.heading}>Detalhes do Equipamento</h2>
          <div className={styles.detailsGrid}>
            <p><strong>Nome:</strong> {equipment.nome}</p>
            <p><strong>Modelo:</strong> {equipment.modelo}</p>
            <p><strong>Marca:</strong> {equipment.marca}</p>
            <p><strong>Tombamento:</strong> {equipment.tombamento || "N/A"}</p>
            <p><strong>Status:</strong> {equipment.status}</p>
            <p><strong>Categoria:</strong> {equipment.categoria}</p>
          </div>
          {equipment.descricao && <p className={styles.description}><strong>Descrição:</strong> {equipment.descricao}</p>}
        </div>
      )}

      <h2 className={`${styles.heading} ${styles.tableTitle}`}>Histórico de Movimentações</h2>
      {history.length === 0 ? (
        <p>Nenhum histórico encontrado para este equipamento.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Data/Hora</th>
                <th className={styles.th}>Local</th>
                <th className={styles.th}>Utilizador</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Alterações</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.td}>{new Date(entry.data_hora).toLocaleString()}</td>
                  <td className={styles.td}>{entry.local || "-"}</td>
                  <td className={styles.td}>{entry.usuario?.username || entry.usuario || "-"}</td>
                  <td className={styles.td}>{entry.status || "-"}</td>
                  <td className={styles.td}>{entry.alteracoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EquipmentHistory;