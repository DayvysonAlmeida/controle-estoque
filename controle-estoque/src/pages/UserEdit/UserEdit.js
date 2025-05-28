import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import api from "../../services/api";
import styles from "./UserEdit.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Estado para armazenar os dados do usuário, incluindo groups_ids para os grupos
  const [userData, setUserData] = useState({
    username: "",
    nome: "",
    email: "",
    funcao: "",
    role: "",
    estoques: [],
    groups_ids: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableStocks, setAvailableStocks] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  // Estados para o modal de redefinição de senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await api.get(`users/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Para os estoques: se vier como objeto, extraímos seus IDs
        let estoques = response.data.estoques || [];
        if (Array.isArray(estoques)) {
          estoques = estoques.map((stock) =>
            typeof stock === "object" && stock.id ? stock.id : stock
          );
        } else {
          estoques = [];
        }
        // Para os grupos: se o campo "groups" existir, extraímos os IDs
        let groups_ids = [];
        if (response.data.groups && Array.isArray(response.data.groups)) {
          groups_ids = response.data.groups.map((group) => group.id);
        }
        // Removemos o campo 'password' (não queremos mostrar ou enviar a senha atual)
        const data = { ...response.data };
        if (data.hasOwnProperty("password")) {
          delete data.password;
        }
        setUserData({
          ...data,
          estoques,
          groups_ids,
        });
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        showNotification("Erro ao carregar os dados do usuário.", "error");
      }
    };

    const fetchStocks = async () => {
      try {
        const response = await api.get("estoques/");
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
    };

    const fetchGroups = async () => {
      try {
        const response = await api.get("groups/");
        const groupsData = response.data.results || response.data;
        const mappedGroups = Array.isArray(groupsData) ? groupsData : [];
        setAvailableGroups(mappedGroups);
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        showNotification("Erro ao buscar grupos.", "error");
      }
    };

    fetchUser();
    fetchStocks();
    fetchGroups();
  }, [userId, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Atualiza a seleção dos estoques via checkbox
  const handleCheckboxChange = (e) => {
    const value = Number(e.target.value);
    const checked = e.target.checked;
    setUserData((prev) => {
      if (checked && !prev.estoques.includes(value)) {
        return { ...prev, estoques: [...prev.estoques, value] };
      }
      if (!checked) {
        return { ...prev, estoques: prev.estoques.filter((id) => id !== value) };
      }
      return prev;
    });
  };

  // Atualiza a seleção dos grupos via checkbox
  const handleGroupCheckboxChange = (e) => {
    const value = Number(e.target.value);
    const checked = e.target.checked;
    setUserData((prev) => {
      let newGroups = prev.groups_ids || [];
      if (checked && !newGroups.includes(value)) {
        newGroups = [...newGroups, value];
      } else if (!checked) {
        newGroups = newGroups.filter((id) => id !== value);
      }
      return { ...prev, groups_ids: newGroups };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    const payload = { ...userData };
    // Se o campo "password" estiver vazio, remova-o para não atualizá-lo
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }
    
    try {
      const token = localStorage.getItem("accessToken");
      // Usamos PATCH para atualizações parciais
      const response = await api.patch(`users/${userId}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        showNotification("Usuário atualizado com sucesso!", "success");
        setTimeout(() => {
          navigate("/usuarios");
        }, 2000);
      } else {
        showNotification("Falha ao atualizar usuário.", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error);
      if (error.response && error.response.data) {
        setFieldErrors(error.response.data);
        showNotification("Verifique os campos com erros.", "error");
      } else {
        showNotification("Erro ao conectar-se ao servidor.", "error");
      }
    }
  };

  // Manipulador para atualizar os dados do modal de redefinição de senha
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para enviar a nova senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    // Validação simples
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("As senhas não conferem.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const payload = { password: passwordData.newPassword };
      const response = await api.patch(`users/${userId}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        showNotification("Senha atualizada com sucesso!", "success");
        setShowResetModal(false);
        // Limpa os campos do modal
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        showNotification("Falha ao atualizar a senha.", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error.response?.data || error);
      showNotification("Erro ao atualizar a senha.", "error");
    }
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h2 className={styles.heading}>
        Editar Usuário: {userData.username}
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Campos de edição do usuário */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Username:</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {fieldErrors.username && (
            <div className={styles.errorText}>
              {Array.isArray(fieldErrors.username)
                ? fieldErrors.username.join(" ")
                : fieldErrors.username}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nome:</label>
          <input
            type="text"
            name="nome"
            value={userData.nome}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {fieldErrors.nome && (
            <div className={styles.errorText}>
              {Array.isArray(fieldErrors.nome)
                ? fieldErrors.nome.join(" ")
                : fieldErrors.nome}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {fieldErrors.email && (
            <div className={styles.errorText}>
              {Array.isArray(fieldErrors.email)
                ? fieldErrors.email.join(" ")
                : fieldErrors.email}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Função:</label>
          <input
            type="text"
            name="funcao"
            value={userData.funcao}
            onChange={handleChange}
            className={styles.input}
          />
          {fieldErrors.funcao && (
            <div className={styles.errorText}>
              {Array.isArray(fieldErrors.funcao)
                ? fieldErrors.funcao.join(" ")
                : fieldErrors.funcao}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Role:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
            className={styles.input}
          >
            <option value="">Selecione...</option>
            <option value="leitor">Leitor</option>
            <option value="padrao">Padrão</option>
            <option value="admin">Administrador</option>
          </select>
          {fieldErrors.role && (
            <div className={styles.errorText}>
              {Array.isArray(fieldErrors.role)
                ? fieldErrors.role.join(" ")
                : fieldErrors.role}
            </div>
          )}
        </div>

        {/* Estoques - Checkboxes */}
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
                    checked={userData.estoques.includes(stock.id)}
                    onChange={handleCheckboxChange}
                  />
                  <span>{stock.nome}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grupos - Checkboxes */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Grupos:</label>
          <div className={styles.checkboxContainer}>
            {availableGroups.length === 0 ? (
              <p>Nenhum grupo disponível</p>
            ) : (
              availableGroups.map((group) => (
                <div key={group.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    name="groups"
                    value={group.id}
                    checked={
                      userData.groups_ids &&
                      userData.groups_ids.includes(group.id)
                    }
                    onChange={handleGroupCheckboxChange}
                  />
                  <span>{group.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botão para abrir o modal de redefinição de senha */}
        <div className={styles.formGroup}>
          <button
            type="button"
            className={styles.button}
            style={{
              backgroundColor: colors.btnprimarybg,
              color: colors.buttonText,
              marginBottom: "1rem",
            }}
            onClick={() => setShowResetModal(true)}
          >
            Redefinir Senha
          </button>
        </div>

        <button
          type="submit"
          className={styles.button}
          style={{
            backgroundColor: colors.btnprimarybg,
            color: colors.buttonText,
          }}
        >
          Atualizar Usuário
        </button>
      </form>

      {/* Modal para redefinição de senha */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Redefinir Senha</h3>
            <form onSubmit={handleResetPassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nova Senha:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmar Senha:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setShowResetModal(false)}
                  style={{
                    marginRight: "1rem",
                    backgroundColor: colors.btnprimarybg,
                    color: colors.buttonText,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.button}
                  style={{
                    backgroundColor: colors.btnprimarybg,
                    color: colors.buttonText,
                  }}
                >
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEdit;
