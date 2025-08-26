// src/pages/EquipmentEdit/EquipmentEdit.js
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./EquipmentEdit.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [isAdmin, setIsAdmin] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({
    nome: "", marca: "", categoria: "", tombamento: "",
    modelo: "", status: "", serialnumber: "", estoque: "",
    sem_tombamento: false, // --- CAMPO ADICIONADO ---
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const userProfileStr = localStorage.getItem("userProfile");
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.is_superuser || (userProfile.groups && userProfile.groups.some(g => g.name === "Administrador"))) {
          setIsAdmin(true);
        }
      } catch (error) { console.error("Erro ao verificar perfil de admin:", error); }
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [equipmentRes, stocksRes] = await Promise.all([
          api.get(`equipments/${id}/`),
          api.get("estoques/")
        ]);

        const equipmentData = location.state || equipmentRes.data;
        const estoqueValue = equipmentData.estoque?.id || equipmentData.estoque || "";
        setFormData({ ...equipmentData, estoque: estoqueValue });

        const stocksData = stocksRes.data.results || stocksRes.data;
        setStocks(Array.isArray(stocksData) ? stocksData : []);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showNotification("Falha ao carregar dados para edição.", "error");
      }
    };
    fetchInitialData();
  }, [id, location.state, showNotification]);

  // --- HANDLECHANGE ATUALIZADO PARA CHECKBOX ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: val };
      // Limpa o tombamento se o checkbox for marcado
      if (name === "sem_tombamento" && checked) {
        newData.tombamento = "";
      }
      return newData;
    });

    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await api.put(`equipments/${id}/`, formData);
      showNotification("Equipamento atualizado com sucesso!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Erro ao atualizar equipamento:", error.response?.data || error);
      if (error.response?.data) {
        setFieldErrors(error.response.data);
        showNotification("Por favor, corrija os erros no formulário.", "error");
      } else {
        showNotification("Ocorreu um erro de rede. Tente novamente.", "error");
      }
    }
  };

  if (!formData.id) return <div className={styles.container}><p>A carregar...</p></div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Editar Equipamento</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Fornecedor</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ""}`} />
            {fieldErrors.nome && <div className={styles.errorText}>{fieldErrors.nome[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Modelo</label>
            <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required className={`${styles.input} ${fieldErrors.modelo ? styles.inputError : ""}`} />
            {fieldErrors.modelo && <div className={styles.errorText}>{fieldErrors.modelo[0]}</div>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Marca</label>
            <input type="text" name="marca" value={formData.marca} onChange={handleChange} required className={`${styles.input} ${fieldErrors.marca ? styles.inputError : ""}`} />
            {fieldErrors.marca && <div className={styles.errorText}>{fieldErrors.marca[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Categoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} required className={`${styles.input} ${fieldErrors.categoria ? styles.inputError : ""}`}>
              <option value="">Selecione...</option>
              <option value="Monitor">Monitor</option>
              <option value="CPU">CPU</option>
              <option value="Notebook">Notebook</option>
              <option value="Raspberry">Raspberry</option>
              <option value="Impressora">Impressora</option>
              <option value="Impressora de Etiqueta">Impressora de Etiqueta</option>
              <option value="Impressora de Pulseira">Impressora de Pulseira</option>
            </select>
            {fieldErrors.categoria && <div className={styles.errorText}>{fieldErrors.categoria[0]}</div>}
          </div>
        </div>

        {/* --- LINHA DO TOMBAMENTO COM CHECKBOX --- */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tombamento</label>
            <input type="text" name="tombamento" value={formData.tombamento} onChange={handleChange} disabled={!isAdmin || formData.sem_tombamento} className={`${styles.input} ${fieldErrors.tombamento ? styles.inputError : ""}`} />
            {fieldErrors.tombamento && <div className={styles.errorText}>{fieldErrors.tombamento[0]}</div>}
          </div>
          <div className={styles.checkboxGroup}>
            <input id="sem_tombamento_checkbox" type="checkbox" name="sem_tombamento" checked={formData.sem_tombamento} onChange={handleChange} disabled={!isAdmin} />
            <label htmlFor="sem_tombamento_checkbox">Sem tombamento</label>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Serial Number</label>
            <input type="text" name="serialnumber" value={formData.serialnumber} onChange={handleChange} required disabled={!isAdmin} className={`${styles.input} ${fieldErrors.serialnumber ? styles.inputError : ""}`} />
            {fieldErrors.serialnumber && <div className={styles.errorText}>{fieldErrors.serialnumber[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required className={styles.input}>
              <option value="">Selecione...</option>
              <option value="Ativo">Ativo</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Inativo">Inativo</option>
              <option value="Substituída">Substituída</option>
              <option value="Backup">Backup</option>
            </select>
          </div>
        </div>
        
        <div className={styles.formGroup}>
            <label className={styles.label}>Estoque</label>
            <select name="estoque" value={formData.estoque} onChange={handleChange} required className={styles.input}>
              <option value="">Selecione o Estoque</option>
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.nome}
                </option>
              ))}
            </select>
        </div>
        
        <div className={styles.buttonContainer}>
          <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className={styles.button}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentEdit;