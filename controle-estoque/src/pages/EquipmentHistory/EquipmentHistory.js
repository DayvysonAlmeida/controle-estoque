import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EquipmentHistory.module.css";

const EquipmentHistory = () => {
  const { equipamentoId } = useParams(); // Obtém o ID do equipamento via rota
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtém os detalhes do equipamento
        const equipmentRes = await api.get(`equipments/${equipamentoId}/`);
        setEquipment(equipmentRes.data);

        // Obtém o histórico do equipamento (considerando paginação, se existir)
        const historyRes = await api.get("equipment-history/", {
          params: { equipment: equipamentoId },
        });
        // Se o endpoint tiver paginação, os dados podem vir em historyRes.data.results
        const historyData = historyRes.data.results || historyRes.data;
        // Ordena de forma decrescente pela data/hora (mais recente primeiro)
        historyData.sort(
          (a, b) => new Date(b.data_hora) - new Date(a.data_hora)
        );
        setHistory(historyData);
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
    return <p className={styles.loading}>Carregando dados do equipamento...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      {equipment && (
        <>
          <h2 className={styles.heading}>Detalhes do Equipamento</h2>
          <div className={styles.details}>
            <p>
              <strong>Nome:</strong> {equipment.nome}
            </p>
            <p>
              <strong>Modelo:</strong> {equipment.modelo}
            </p>
            <p>
              <strong>Marca:</strong> {equipment.marca}
            </p>
            <p>
              <strong>Tombamento:</strong> {equipment.tombamento}
            </p>
            <p>
              <strong>Status:</strong> {equipment.status}
            </p>
            <p>
              <strong>Descrição:</strong> {equipment.descricao}
            </p>
            <p>
              <strong>Categoria:</strong> {equipment.categoria}
            </p>
          </div>
        </>
      )}

      <h2 className={styles.subHeading}>Histórico de Movimentações</h2>
      {history.length === 0 ? (
        <p className={styles.noHistory}>
          Nenhum histórico encontrado para este equipamento.
        </p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Data/Hora</th>
                <th className={styles.tableHeader}>Local</th>
                <th className={styles.tableHeader}>Usuário</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Alterações</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {new Date(entry.data_hora).toLocaleString()}
                  </td>
                  <td className={styles.tableCell}>
                    {entry.local || "-"}
                  </td>
                  <td className={styles.tableCell}>
                    {entry.usuario && typeof entry.usuario === "object"
                      ? entry.usuario.username || entry.usuario.nome
                      : entry.usuario}
                  </td>
                  <td className={styles.tableCell}>
                    {entry.status || "-"}
                  </td>
                  <td className={styles.tableCell}>{entry.alteracoes}</td>
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
