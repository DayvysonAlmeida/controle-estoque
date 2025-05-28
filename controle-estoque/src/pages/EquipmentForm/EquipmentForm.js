import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import api from "../../services/api";
import styles from "./EquipmentForm.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const EquipmentForm = () => {
  const { estoqueId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    marca: "",
    tombamento: "",
    status: "",
    descricao: "",
    categoria: "",
    serialnumber: "",
  });

  // Estado para armazenar erros por campo, se houver
  const [fieldErrors, setFieldErrors] = useState({});

  // Atualiza os valores do formulário e limpa o erro do campo, se houver
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Função específica para o campo tombamento que aceita apenas números ou em branco
  const handleTombamentoChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  // Submissão do formulário para a API de criação de equipamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); // Limpa erros anteriores
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
        // Se houver uma propriedade "error", exibe-a; caso contrário, mapeia os erros por campo
        if (error.response.data.error) {
          showNotification(error.response.data.error, "error");
        } else {
          setFieldErrors(error.response.data);
          showNotification("Verifique os campos com erros.", "error");
        }
      } else {
        showNotification("Erro ao conectar-se ao servidor.", "error");
      }
    }
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h2 className={styles.heading}>
        Cadastrar Equipamento (Estoque ID: {estoqueId})
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ""}`}
          />
          {fieldErrors.nome && <div className={styles.errorText}>{fieldErrors.nome}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Modelo:</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.modelo ? styles.inputError : ""}`}
          />
          {fieldErrors.modelo && <div className={styles.errorText}>{fieldErrors.modelo}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Marca:</label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.marca ? styles.inputError : ""}`}
          />
          {fieldErrors.marca && <div className={styles.errorText}>{fieldErrors.marca}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tombamento:</label>
          <input
            type="text"
            name="tombamento"
            value={formData.tombamento}
            onChange={handleTombamentoChange}
            required
            className={`${styles.input} ${fieldErrors.tombamento ? styles.inputError : ""}`}
          />
          {fieldErrors.tombamento && <div className={styles.errorText}>{fieldErrors.tombamento}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>SerialNumber:</label>
          <input
            type="text"
            name="serialnumber"
            value={formData.serialnumber}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.serialnumber ? styles.inputError : ""}`}
          />
          {fieldErrors.serialnumber && <div className={styles.errorText}>{fieldErrors.serialnumber}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.status ? styles.inputError : ""}`}
          >
            <option value="">Selecione...</option>
            <option value="Ativo">Ativo</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Inativo">Inativo</option>
          </select>
          {fieldErrors.status && <div className={styles.errorText}>{fieldErrors.status}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Categoria:</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className={`${styles.input} ${fieldErrors.categoria ? styles.inputError : ""}`}
          >
            <option value="">Selecione...</option>
            <option value="Monitor">Monitor</option>
            <option value="CPU">CPU</option>
            <option value="Notebook">Notebook</option>
            <option value="Raspberry">Raspberry</option>
          </select>
          {fieldErrors.categoria && <div className={styles.errorText}>{fieldErrors.categoria}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Descrição:</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            className={`${styles.textarea} ${fieldErrors.descricao ? styles.inputError : ""}`}
          ></textarea>
          {fieldErrors.descricao && <div className={styles.errorText}>{fieldErrors.descricao}</div>}
        </div>

        <button
          type="submit"
          className={styles.button}
          style={{ backgroundColor: colors.btnprimarybg, color: colors.buttonText }}
        >
          Cadastrar Equipamento
        </button>
      </form>
    </div>
  );
};

export default EquipmentForm;
