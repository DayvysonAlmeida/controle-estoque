// src/pages/EquipmentForm/EquipmentForm.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// useTheme não é mais necessário para estilização direta
import api from "../../services/api";
import styles from "./EquipmentForm.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const EquipmentForm = () => {
  const { estoqueId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [stockName, setStockName] = useState("");

  useEffect(() => {
    async function fetchStock() {
      try {
        const response = await api.get(`estoques/${estoqueId}/`);
        setStockName(response.data.nome);
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);
      }
    }
    if (estoqueId) {
      fetchStock();
    }
  }, [estoqueId]);

  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    marca: "",
    tombamento: "",
    status: "",
    descricao: "",
    categoria: "",
    serialnumber: "",
    sem_tombamento: false,
    ip: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTombamentoChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showNotification("Usuário não autenticado. Faça login novamente.", "error");
        return;
      }
      const payload = { ...formData, estoque: estoqueId };
      const response = await api.post("equipments/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        showNotification("Equipamento cadastrado com sucesso!", "success");
        setTimeout(() => {
          navigate(`/estoque/${estoqueId}`);
        }, 2000);
      } else {
        showNotification("Falha ao cadastrar equipamento.", "error");
      }
    } catch (error) {
      console.error("Erro ao cadastrar equipamento:", error.response?.data || error);
      if (error.response && error.response.data) {
        const errors = error.response.data;
        if (errors.error) {
          showNotification(errors.error, "error");
        } else {
          const normalized = {};
          Object.keys(errors).forEach((key) => {
            normalized[key] = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
          });
          setFieldErrors(normalized);
          showNotification("Verifique os campos com erros.", "error");
        }
      } else {
        showNotification("Erro ao conectar-se ao servidor.", "error");
      }
    }
  };

  return (
    // Removido o style inline! O CSS cuida de tudo.
    <div className={styles.container}>
      <h2 className={styles.heading}>
        Cadastrar Equipamento em: {stockName || "..."}
      </h2>

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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tombamento</label>
            <input type="text" name="tombamento" value={formData.tombamento} onChange={handleTombamentoChange} disabled={formData.sem_tombamento} className={`${styles.input} ${fieldErrors.tombamento ? styles.inputError : ""}`} />
            {fieldErrors.tombamento && <div className={styles.errorText}>{fieldErrors.tombamento[0]}</div>}
          </div>
          <div className={styles.checkboxGroup}>
            <input id="sem_tombamento_checkbox" type="checkbox" name="sem_tombamento" checked={formData.sem_tombamento} onChange={handleChange} />
            <label htmlFor="sem_tombamento_checkbox">Sem tombamento</label>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Endereço IP</label>
            <input type="text" name="ip" value={formData.ip || ""} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Serial Number</label>
            <input type="text" name="serialnumber" value={formData.serialnumber} onChange={handleChange} required className={styles.input} />
          </div>
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

        <div className={styles.formGroup}>
          <label className={styles.label}>Descrição</label>
          <textarea name="descricao" value={formData.descricao} onChange={handleChange} required className={styles.textarea}></textarea>
        </div>

        <div className={styles.buttonContainer}>
          <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className={styles.button}>
            Cadastrar Equipamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;