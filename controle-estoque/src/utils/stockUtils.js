// src/utils/stockUtils.js
import api from "../services/api";

export const fetchStockName = async (stockId) => {
  try {
    const response = await api.get(`estoques/${stockId}`);
    // Tenta retornar o nome do estoque, considerando que a API pode retornar a propriedade "nome" ou "name"
    return response.data.nome || response.data.name || "Nome não disponível";
  } catch (error) {
    console.error("Erro ao buscar detalhes do estoque:", error);
    return "Nome não disponível";
  }
};
