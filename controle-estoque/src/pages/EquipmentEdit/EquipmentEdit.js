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

  // Estado para controlar se o usuário é administrador baseado nos grupos salvos em localStorage
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userProfileStr = localStorage.getItem("userProfile");
    if (!userProfileStr) {
      setIsAdmin(false);
      return;
    }
    try {
      const userProfile = JSON.parse(userProfileStr);
      // Se for superusuário, retorna true
      if (userProfile.is_superuser) {
        setIsAdmin(true);
        return;
      }
      if (userProfile.groups && Array.isArray(userProfile.groups)) {
        // Verifica se existe algum grupo cujo nome (em minúsculo) seja "administrador"
        if (
          userProfile.groups.some(
            (group) =>
              group.name &&
              group.name.toLowerCase() === "administrador"
          )
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erro ao parsear userProfile:", error);
      setIsAdmin(false);
    }
  }, []);

  // Estados para armazenar o equipamento, estoques e os dados do formulário
  const [equipment, setEquipment] = useState(location.state || null);
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    categoria: "",
    tombamento: "",
    modelo: "",
    status: "",
    serialnumber: "",
    estoque: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Preenche os dados do equipamento
  useEffect(() => {
    if (!equipment) {
      api.get(`equipments/${id}/`)
        .then((res) => {
          setEquipment(res.data);
          const estoqueValue =
            res.data.estoque && res.data.estoque.id
              ? res.data.estoque.id
              : res.data.estoque || "";
          setFormData({ ...res.data, estoque: estoqueValue });
        })
        .catch((error) => console.error("Erro ao buscar equipamento:", error));
    } else {
      const estoqueValue =
        equipment.estoque && equipment.estoque.id
          ? equipment.estoque.id
          : equipment.estoque || "";
      setFormData({ ...equipment, estoque: estoqueValue });
    }
  }, [equipment, id]);

  // Carrega a lista de estoques
  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await api.get("estoques/");
        let allStocks = response.data;
        if (!Array.isArray(allStocks)) {
          allStocks = allStocks.results || [];
        }
        setStocks(allStocks);
      } catch (error) {
        console.error("Erro ao buscar estoques:", error);
        showNotification("Erro ao buscar estoques.", "error");
      }
    }
    fetchStocks();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`equipments/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showNotification("Equipamento atualizado com sucesso!", "success");
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error("Erro ao atualizar equipamento:", error.response?.data || error);
      if (error.response && error.response.data) {
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

  if (!formData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Editar Equipamento</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Campo: Nome */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Nome</label>
          <input
            type="text"
            name="nome"
            className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ""}`}
            value={formData.nome}
            onChange={handleChange}
          />
          {fieldErrors.nome && <div className={styles.errorText}>{fieldErrors.nome}</div>}
        </div>
        {/* Campo: Marca */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Marca</label>
          <input
            type="text"
            name="marca"
            className={`${styles.input} ${fieldErrors.marca ? styles.inputError : ""}`}
            value={formData.marca}
            onChange={handleChange}
          />
          {fieldErrors.marca && <div className={styles.errorText}>{fieldErrors.marca}</div>}
        </div>
        {/* Campo: Categoria */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Categoria</label>
          <input
            type="text"
            name="categoria"
            className={`${styles.input} ${fieldErrors.categoria ? styles.inputError : ""}`}
            value={formData.categoria}
            onChange={handleChange}
          />
          {fieldErrors.categoria && <div className={styles.errorText}>{fieldErrors.categoria}</div>}
        </div>
        {/* Campo: Tombamento – somente editável para administradores */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Tombamento</label>
          <input
            type="number"
            name="tombamento"
            className={`${styles.input} ${fieldErrors.tombamento ? styles.inputError : ""}`}
            value={formData.tombamento}
            onChange={handleChange}
            disabled={!isAdmin}
          />
          {fieldErrors.tombamento && <div className={styles.errorText}>{fieldErrors.tombamento}</div>}
        </div>
        {/* Campo: Modelo */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Modelo</label>
          <input
            type="text"
            name="modelo"
            className={`${styles.input} ${fieldErrors.modelo ? styles.inputError : ""}`}
            value={formData.modelo}
            onChange={handleChange}
          />
          {fieldErrors.modelo && <div className={styles.errorText}>{fieldErrors.modelo}</div>}
        </div>
        {/* Campo: Status */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <select
            name="status"
            className={`${styles.input} ${fieldErrors.status ? styles.inputError : ""}`}
            value={formData.status}
            onChange={handleChange}
          >
            <option value="">Selecione o status</option>
            <option value="Ativo">Ativo</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Inativo">Inativo</option>
          </select>
          {fieldErrors.status && <div className={styles.errorText}>{fieldErrors.status}</div>}
        </div>
        {/* Campo: Serial Number – somente editável para administradores */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Serial Number</label>
          <input
            type="text"
            name="serialnumber"
            className={`${styles.input} ${fieldErrors.serialnumber ? styles.inputError : ""}`}
            value={formData.serialnumber}
            onChange={handleChange}
            disabled={!isAdmin}
          />
          {fieldErrors.serialnumber && <div className={styles.errorText}>{fieldErrors.serialnumber}</div>}
        </div>
        {/* Campo: Estoque */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Estoque</label>
          <select
            name="estoque"
            className={`${styles.input} ${fieldErrors.estoque ? styles.inputError : ""}`}
            value={formData.estoque}
            onChange={handleChange}
          >
            <option value="">Selecione o Estoque</option>
            {stocks.map((stock) => (
              <option key={stock.id} value={stock.id}>
                {stock.nome}
              </option>
            ))}
          </select>
          {fieldErrors.estoque && <div className={styles.errorText}>{fieldErrors.estoque}</div>}
        </div>
        <button type="submit" className={styles.button}>
          Salvar Alterações
        </button>
      </form>
    </div>
  );
};

export default EquipmentEdit;
