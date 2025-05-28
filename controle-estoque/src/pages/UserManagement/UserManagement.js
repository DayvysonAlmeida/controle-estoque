import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import api from "../../services/api";
import styles from "./UserManagement.module.css";

// ... (restante do código permanece inalterado)
const UserManagement = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  // Inicia o estado com 5 itens por página
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Busca os usuários reais do backend
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("users/");
        const fetchedUsers = response.data.results || response.data;
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }
    fetchUsers();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedUsers = users.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleEditUser = (id) => {
    navigate(`/usuarios/${id}/editar`);
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );
    if (confirmDelete) {
      try {
        await api.delete(`users/${id}/`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const handleAddUser = () => {
    navigate("/usuarios/novo");
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <h2 className={styles.heading} style={{ color: colors.primary }}>
        Gerenciamento de Usuários
      </h2>
      <button
        className={styles.addButton}
        style={{ backgroundColor: colors.primary, color: colors.buttonText }}
        onClick={handleAddUser}
      >
        + Adicionar Usuário
      </button>

      <table className={styles.table} style={{ borderColor: colors.border }}>
        <thead>
          <tr style={{ backgroundColor: colors.secondary, color: colors.text }}>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Username</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>Função</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.id} className={styles.tr}>
              <td className={styles.td}>{user.nome}</td>
              <td className={styles.td}>{user.username}</td>
              <td className={styles.td}>{user.email}</td>
              <td className={styles.td}>{user.funcao}</td>
              <td className={styles.td}>{user.role}</td>
              <td className={styles.td}>
                <button
                  className={styles.actionButton}
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.buttonText,
                  }}
                  onClick={() => handleEditUser(user.id)}
                >
                  Editar
                </button>
                <button
                  className={styles.actionButton}
                  style={{ backgroundColor: "red", color: colors.buttonText }}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

            {/* Seletor para ajustar o número de itens por página */}
            <div className={styles.itemsPerPage}>
        <label htmlFor="itemsPerPage">Itens por página:</label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setPage(1); // Reseta para a primeira página sempre que mudar o valor
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      <Stack spacing={2} sx={{ marginTop: "20px", alignItems: "center" }}>
        <Pagination
          count={Math.ceil(users.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
          sx={{ color: colors.text }}
        />
      </Stack>
    </div>
  );
};

export default UserManagement;
