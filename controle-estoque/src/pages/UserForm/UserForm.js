import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import api from "../../services/api";
import styles from "./UserForm.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const UserForm = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Estado para armazenar os estoques disponíveis para seleção
  const [availableStocks, setAvailableStocks] = useState([]);
  
  // Estado para os grupos (funções/permissions) vindos do endpoint
  const [groups, setGroups] = useState([]);

  // Busca os estoques disponíveis do backend (executa apenas uma vez)
  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await api.get("estoques/");
        // Se o backend usar paginação, usa response.data.results; caso contrário response.data
        const stocks = response.data.results || response.data;
        const mappedStocks = Array.isArray(stocks)
          ? stocks.map((stock) => ({
              id: stock.id,
              nome: stock.nome,
            }))
          : [];
        setAvailableStocks(mappedStocks);
      } catch (error) {
        console.error("Erro ao buscar estoques:", error);
        showNotification("Erro ao buscar estoques.", "error");
      }
    }
    fetchStocks();
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Busca os grupos disponíveis do endpoint (executa apenas uma vez)
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await api.get("groups/");
        console.log("Resposta dos grupos:", response.data);
        // Utiliza response.data.results se existir, caso contrário response.data
        let data = response.data.results || response.data;
        // Se não for um array, força a conversão para array vazio
        if (!Array.isArray(data)) {
          data = [];
        }
        setGroups(data);
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        showNotification("Erro ao buscar grupos.", "error");
      }
    }
    fetchGroups();
  }, []); // Executa uma única vez

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    username: "",
    senha: "",
    funcao: "",
    estoques: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Recupera o token e cria a payload ajustando "senha" para "password"
      const token = localStorage.getItem("accessToken");
      const payload = { ...formData, password: formData.senha };
      delete payload.senha;

      const response = await api.post("users/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        showNotification("Usuário cadastrado com sucesso!", "success");
        setTimeout(() => {
          navigate("/usuarios");
        }, 2000);
      } else {
        showNotification("Falha ao cadastrar usuário.", "error");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.response?.data || error);
      showNotification("Erro ao conectar-se ao servidor.", "error");
    }
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h2 className={styles.heading} style={{ color: colors.primary }}>
        Cadastro de Usuário
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Campo Nome */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className={styles.input}
            style={{ borderColor: colors.border }}
          />
        </div>

        {/* Campo Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            style={{ borderColor: colors.border }}
          />
        </div>

        {/* Campo Usuário */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Usuário:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.input}
            style={{ borderColor: colors.border }}
          />
        </div>

        {/* Campo Senha */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            className={styles.input}
            style={{ borderColor: colors.border }}
          />
        </div>

        {/* Campo Função */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Função:</label>
          <select
            name="funcao"
            value={formData.funcao}
            onChange={handleChange}
            required
            className={styles.input}
            style={{ borderColor: colors.border }}
          >
            <option value="">Selecione...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seção de Estoques via Checkboxes */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Estoques:</label>
          <div className={styles.checkboxContainer}>
            {availableStocks.length === 0 ? (
              <p>Nenhum estoque disponível</p>
            ) : (
              availableStocks.map((stock) => (
                <div key={stock.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    name="estoques"
                    value={stock.id}
                    checked={formData.estoques.includes(stock.id)}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const checked = e.target.checked;
                      setFormData((prev) => {
                        if (checked && !prev.estoques.includes(value)) {
                          return { ...prev, estoques: [...prev.estoques, value] };
                        }
                        if (!checked) {
                          return { ...prev, estoques: prev.estoques.filter((id) => id !== value) };
                        }
                        return prev;
                      });
                    }}
                  />
                  <span>{stock.nome}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          type="submit"
          className={styles.button}
          style={{ backgroundColor: colors.primary, color: colors.buttonText }}
        >
          Cadastrar Usuário
        </button>
      </form>
    </div>
  );
};

export default UserForm;
