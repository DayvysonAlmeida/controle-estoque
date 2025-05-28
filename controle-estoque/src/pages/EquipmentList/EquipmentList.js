// src/pages/EquipmentList/EquipmentList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/theme";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import api from "../../services/api";
import EquipmentFilters from "../../components/EquipmentFilters/EquipmentFilters";
import styles from "./EquipmentList.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const EquipmentList = () => {
  const { estoqueId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Recupera o objeto do usuário salvo no localStorage usando a chave "userProfile"
  const currentUser = JSON.parse(localStorage.getItem("userProfile"));
  // console.log("Current user:", currentUser);

  // Função para verificar se o usuário tem permissão para adicionar e editar 
  // (tanto Administrador quanto Padrão podem adicionar e editar)
  const hasManagePermission = () => {
    if (!currentUser) return false;
    if (currentUser.is_superuser) return true;
    if (currentUser.groups && Array.isArray(currentUser.groups)) {
      // Verifica se existe algum grupo com name "Administrador" ou "Padrão"
      return currentUser.groups.some(
        (group) => group.name === "Administrador" || group.name === "Padrão"
      );
    }
    return false;
  };
  
  // Função específica para deletar: apenas Administrador pode!
  const canDelete = () => {
    if (!currentUser) return false;
    if (currentUser.is_superuser) return true;
    if (currentUser.groups && Array.isArray(currentUser.groups)) {
      return currentUser.groups.some((group) => group.name === "Administrador");
    }
    return false;
  };
  

  // Estados do componente
  const [stockName, setStockName] = useState("");
  const [allowedStocks, setAllowedStocks] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [filters, setFilters] = useState({
    nome: "",
    marca: "",
    categoria: "",
    tombamento: "",
    modelo: "",
    status: "",
    serialnumber: "",
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  // Busca os estoques permitidos conforme perfil do usuário (via endpoint de perfil)
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("profile/");
        setAllowedStocks(response.data.estoques || []);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        showNotification("Erro ao buscar perfil.", "error");
      }
    }
    fetchProfile();
  }, [showNotification]);

  // Redireciona se o usuário tentar acessar um estoque que não está associado ao seu perfil
  useEffect(() => {
    if (estoqueId && allowedStocks.length > 0) {
      const estoqueIdNum = Number(estoqueId);
      if (!allowedStocks.includes(estoqueIdNum)) {
        navigate(`/estoque/${allowedStocks[0]}`);
      }
    }
  }, [estoqueId, allowedStocks, navigate]);

  // Busca os equipamentos do estoque selecionado
  useEffect(() => {
    if (estoqueId) {
      async function fetchEquipments() {
        try {
          const response = await api.get("equipments/", {
            params: { estoque: estoqueId },
          });
          setEquipments(response.data.results || response.data);
        } catch (error) {
          console.error("Erro ao buscar equipamentos:", error);
          showNotification("Erro ao buscar equipamentos.", "error");
        }
      }
      fetchEquipments();
    }
  }, [estoqueId, showNotification]);

  // Busca os detalhes do estoque, por exemplo, seu nome
  useEffect(() => {
    if (estoqueId) {
      async function fetchStockDetail() {
        try {
          const response = await api.get(`estoques/${estoqueId}`);
          setStockName(
            response.data.nome || response.data.name || "Nome não disponível"
          );
        } catch (error) {
          console.error("Erro ao buscar detalhes do estoque:", error);
          showNotification("Erro ao buscar detalhes do estoque.", "error");
        }
      }
      fetchStockDetail();
    }
  }, [estoqueId, showNotification]);

  // Funções para manipulação dos filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      nome: "",
      marca: "",
      categoria: "",
      tombamento: "",
      modelo: "",
      status: "",
      serialnumber: "",
    });
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Funções para editar e excluir equipamentos
  const handleEditEquipment = (equipment) => {
    navigate(`/equipamento/${equipment.id}/editar`, { state: equipment });
  };

  const handleOpenDeleteDialog = (id) => {
    setEquipmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`equipments/${equipmentToDelete}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEquipments((prev) =>
        prev.filter((equipment) => equipment.id !== equipmentToDelete)
      );
      handleCloseDeleteDialog();
      showNotification("Equipamento excluído com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      showNotification("Erro ao excluir equipamento.", "error");
    }
  };

  // Filtragem dos equipamentos conforme os filtros aplicados
  const filteredEquipments = useMemo(() => {
    return equipments.filter((equipment) => {
      return (
        (!filters.nome ||
          equipment.nome.toLowerCase().includes(filters.nome.toLowerCase())) &&
        (!filters.marca ||
          (equipment.marca &&
            equipment.marca.toLowerCase().includes(filters.marca.toLowerCase()))) &&
        (!filters.categoria ||
          (equipment.categoria &&
            equipment.categoria.toLowerCase().includes(filters.categoria.toLowerCase()))) &&
        (!filters.tombamento ||
          (equipment.tombamento &&
            equipment.tombamento.toString().toLowerCase().includes(filters.tombamento.toLowerCase()))) &&
        (!filters.modelo ||
          (equipment.modelo &&
            equipment.modelo.toLowerCase().includes(filters.modelo.toLowerCase()))) &&
        (!filters.status || equipment.status === filters.status) &&
        (!filters.serialnumber ||
          (equipment.serialnumber &&
            equipment.serialnumber.toLowerCase().includes(filters.serialnumber.toLowerCase())))
      );
    });
  }, [equipments, filters]);

  // Paginação dos equipamentos
  const paginatedEquipments = useMemo(() => {
    return filteredEquipments.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [filteredEquipments, page, itemsPerPage]);

  const handleNewEquipment = () => {
    navigate(`/estoque/${estoqueId}/novo-equipamento`);
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors.background, color: colors.textprimary }}
    >
      <h2 className={styles.heading}>
        Equipamentos do Estoque: {stockName || estoqueId}
      </h2>
  
      {/* Filtros para equipamentos */}
      <EquipmentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
  
      {/* Botão para adicionar equipamento, visível para usuários com permissão */}
      {hasManagePermission() && (
        <button onClick={handleNewEquipment} className={styles.button}>
          + Add Equipamento
        </button>
      )}
  
      {/* Seletor de itens por página */}
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
  
      <div className={styles.tableContainer}>
        <table className={styles.table} style={{ borderColor: colors.border }}>
          <thead>
            <tr style={{ backgroundColor: colors.menuborder }}>
              <th className={styles.th}>Nome</th>
              <th className={styles.th}>Marca</th>
              <th className={styles.th}>Categoria</th>
              <th className={styles.th}>Tombamento</th>
              <th className={styles.th}>Modelo</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Serial</th>
              <th className={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEquipments.map((equipment) => (
              <tr key={equipment.id}>
                <td
                  className={styles.td}
                  style={{ cursor: "pointer", color: colors.primary }}
                  onClick={() => navigate(`/equipamento/${equipment.id}`)}
                >
                  {equipment.nome}
                </td>
                <td className={styles.td}>{equipment.marca}</td>
                <td className={styles.td}>{equipment.categoria}</td>
                <td className={styles.td}>{equipment.tombamento}</td>
                <td className={styles.td}>{equipment.modelo}</td>
                <td className={styles.td}>{equipment.status}</td>
                <td className={styles.td}>{equipment.serialnumber}</td>
                <td className={styles.td}>
                  {hasManagePermission() && (
                    <>
                      <button
                        className={styles.actionButton}
                        style={{
                          backgroundColor: colors.btnprimarybg,
                          color: colors.buttonText,
                        }}
                        onClick={() => handleEditEquipment(equipment)}
                      >
                        Editar
                      </button>
                      {canDelete() && (
                        <button
                          className={styles.actionButton}
                          style={{
                            backgroundColor: colors.chartcolor4,
                            color: colors.buttonText,
                          }}
                          onClick={() => handleOpenDeleteDialog(equipment.id)}
                        >
                          Excluir
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <Stack spacing={2} sx={{ marginTop: "20px", alignItems: "center" }}>
        <Pagination
          count={Math.ceil(filteredEquipments.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
        />
      </Stack>
  
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este equipamento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 
  
export default EquipmentList;
