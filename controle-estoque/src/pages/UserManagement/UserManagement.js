// src/pages/UserManagement/UserManagement.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from "../../services/api";
import styles from "./UserManagement.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const UserManagement = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("users/");
        const fetchedUsers = response.data.results || response.data;
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Erro ao buscar utilizadores:", error);
        showNotification("Falha ao carregar a lista de utilizadores.", "error");
      }
    }
    fetchUsers();
  }, [showNotification]);

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
      "Tem certeza que deseja excluir este utilizador? Esta ação não pode ser desfeita."
    );
    if (confirmDelete) {
      try {
        await api.delete(`users/${id}/`);
        setUsers(users.filter((user) => user.id !== id));
        showNotification("Utilizador excluído com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao excluir utilizador:", error);
        showNotification("Erro ao excluir utilizador.", "error");
      }
    }
  };

  const handleAddUser = () => {
    navigate("/usuarios/novo");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Gestão de Utilizadores</h2>
        <button className={styles.button} onClick={handleAddUser}>
          + Adicionar Utilizador
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Nome</th>
              <th className={styles.th}>Username</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Função</th>
              <th className={styles.th}>Role</th>
              <th className={`${styles.th} ${styles.centerAlign}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td className={styles.td}>{user.nome}</td>
                <td className={styles.td}>{user.username}</td>
                <td className={styles.td}>{user.email}</td>
                <td className={styles.td}>{user.funcao || "-"}</td>
                <td className={styles.td}>
                  <span className={`${styles.roleBadge} ${
                    user.role === 'admin' ? styles.roleAdmin : 
                    user.role === 'padrao' ? styles.rolePadrao : 
                    styles.roleLeitor
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.centerAlign}`}>
                  <button title="Editar Utilizador" className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleEditUser(user.id)}>
                    <EditIcon fontSize="small" />
                  </button>
                  <button title="Excluir Utilizador" className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteUser(user.id)}>
                    <DeleteForeverIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Stack spacing={2} sx={{ marginTop: "20px", alignItems: "center" }}>
        <Pagination
          count={Math.ceil(users.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
        />
        <div className={styles.itemsPerPage}>
          <label htmlFor="itemsPerPage">Itens por página:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </Stack>
    </div>
  );
};

export default UserManagement;