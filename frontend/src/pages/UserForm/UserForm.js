// src/pages/UserForm/UserForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./UserForm.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const UserForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [availableStocks, setAvailableStocks] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const stocksRes = await api.get("estoques/");
        const stocksData = stocksRes.data.results || stocksRes.data;
        setAvailableStocks(Array.isArray(stocksData) ? stocksData : []);

        const groupsRes = await api.get("groups/");
        const groupsData = groupsRes.data.results || groupsRes.data;
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        showNotification("Falha ao carregar dados para o formulário.", "error");
      }
    }
    fetchInitialData();
  }, [showNotification]);

  const [formData, setFormData] = useState({
    nome: "", email: "", username: "", password: "", funcao: "", estoques: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  
  const handleCheckboxChange = (e) => {
    const value = Number(e.target.value);
    const checked = e.target.checked;
    setFormData((prev) => {
      const { estoques } = prev;
      if (checked && !estoques.includes(value)) {
        return { ...prev, estoques: [...estoques, value] };
      }
      if (!checked) {
        return { ...prev, estoques: estoques.filter((id) => id !== value) };
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      // Renomeia 'senha' para 'password' para corresponder à API
      const payload = { ...formData, password: formData.senha };
      delete payload.senha;

      await api.post("users/", payload);
      showNotification("Utilizador criado com sucesso!", "success");
      navigate("/usuarios");
    } catch (error) {
      console.error("Erro ao criar utilizador:", error.response?.data || error);
      if (error.response?.data) {
        setFieldErrors(error.response.data);
        showNotification("Por favor, corrija os erros no formulário.", "error");
      } else {
        showNotification("Ocorreu um erro de rede. Tente novamente.", "error");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Criar Novo Utilizador</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome Completo</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ""}`} />
            {fieldErrors.nome && <div className={styles.errorText}>{fieldErrors.nome[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome de Utilizador</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required className={`${styles.input} ${fieldErrors.username ? styles.inputError : ""}`} />
            {fieldErrors.username && <div className={styles.errorText}>{fieldErrors.username[0]}</div>}
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`} />
            {fieldErrors.email && <div className={styles.errorText}>{fieldErrors.email[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Senha</label>
            <input type="password" name="senha" value={formData.senha} onChange={handleChange} required className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`} />
            {fieldErrors.password && <div className={styles.errorText}>{fieldErrors.password[0]}</div>}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Função / Grupo</label>
          <select name="funcao" value={formData.funcao} onChange={handleChange} required className={`${styles.input} ${fieldErrors.funcao ? styles.inputError : ""}`}>
            <option value="">Selecione...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </select>
          {fieldErrors.funcao && <div className={styles.errorText}>{fieldErrors.funcao[0]}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Acesso aos Estoques</label>
          <div className={styles.checkboxContainer}>
            {availableStocks.map((stock) => (
              <div key={stock.id} className={styles.checkboxItem}>
                <input type="checkbox" id={`stock-${stock.id}`} name="estoques" value={stock.id} checked={formData.estoques.includes(stock.id)} onChange={handleCheckboxChange} />
                <label htmlFor={`stock-${stock.id}`}>{stock.nome}</label>
              </div>
            ))}
          </div>
          {fieldErrors.estoques && <div className={styles.errorText}>{fieldErrors.estoques[0]}</div>}
        </div>
        <div className={styles.buttonContainer}>
          <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className={styles.button}>
            Criar Utilizador
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;