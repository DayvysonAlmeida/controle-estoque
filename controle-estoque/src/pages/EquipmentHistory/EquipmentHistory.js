// src/pages/EquipmentHistory/EquipmentHistory.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EquipmentHistory.module.css";

const EquipmentHistory = () => {
  const { equipamentoId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);

  const userMap = useMemo(() => new Map(users.map(user => [user.id, user.username])), [users]);
  const stockMap = useMemo(() => new Map(stocks.map(stock => [stock.id, stock.nome])), [stocks]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [equipmentRes, historyRes, usersRes, stocksRes] = await Promise.all([
          api.get(`equipments/${equipamentoId}/`),
          api.get("equipment-history/", { params: { equipment: equipamentoId } }),
          api.get("users/"),
          api.get("estoques/")
        ]);
        
        setEquipment(equipmentRes.data);
        setUsers(usersRes.data.results || usersRes.data);
        setStocks(stocksRes.data.results || stocksRes.data);

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
  
  // --- FUNÇÕES DE TRADUÇÃO CORRIGIDAS E CENTRALIZADAS ---

  // Função para obter o nome do estoque a partir do seu ID
  const getStockNameById = (stockId) => stockMap.get(stockId) || `ID ${stockId}`;

  // Função que traduz a string 'alteracoes', substituindo todos os IDs de estoque por nomes
  const translateAlteracoesString = (alteracoes) => {
    if (typeof alteracoes !== 'string') return alteracoes;
    return alteracoes.replace(/(\d+)/g, (match) => {
      const id = parseInt(match, 10);
      return stockMap.get(id) || match;
    });
  };

  // Função para obter o "Local" de destino a partir da string 'alteracoes'
  const getDestinationStockName = (entry) => {
    // Se a API fornecer o campo 'estoque', usa-o (mais fiável)
    if (entry.estoque) {
        return getStockNameById(entry.estoque);
    }
    // Senão, tenta extrair da string 'alteracoes'
    if (typeof entry.alteracoes === 'string') {
        const match = entry.alteracoes.match(/para (?:estoque )?(\d+)/);
        if (match && match[1]) {
            const stockId = parseInt(match[1], 10);
            return getStockNameById(stockId);
        }
    }
    return "N/A"; // Fallback
  };


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
            <p><strong>Tombamento:</strong> {equipment.tombamento || "Sem tombamento"}</p>
            <p><strong>Status:</strong> {equipment.status}</p>
            <p><strong>Estoque Atual:</strong> {getStockNameById(equipment.estoque?.id || equipment.estoque)}</p>
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
                <th className={styles.th}>Local Atual</th>
                <th className={styles.th}>Usuário</th>
                {/* <th className={styles.th}>Status</th> */}
                <th className={styles.th}>Descrição da Alteração</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.td}>{new Date(entry.data_hora).toLocaleString()}</td>
                  <td className={styles.td}>{getDestinationStockName(entry)}</td>
                  <td className={styles.td}>{userMap.get(entry.usuario) || entry.usuario || "-"}</td>
                  {/* <td className={styles.td}>{entry.status || "-"}</td> */}
                  <td className={styles.td}>{translateAlteracoesString(entry.alteracoes)}</td>
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