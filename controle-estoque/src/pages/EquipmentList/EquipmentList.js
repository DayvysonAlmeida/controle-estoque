// src/pages/EquipmentList/EquipmentList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import api from "../../services/api";
import EquipmentFilters from "../../components/EquipmentFilters/EquipmentFilters";
import styles from "./EquipmentList.module.css";
import { useNotification } from "../../contexts/NotificationProvider";
import { CSVLink } from "react-csv";
// --- A CORREÇÃO ESTÁ AQUI ---
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'; // Importação corrigida
import { hasManagePermission, canDelete } from "../../utils/authUtils";

const EquipmentList = () => {
  const { estoqueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const currentUser = JSON.parse(localStorage.getItem("userProfile"));
  
  const [exportData, setExportData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const csvLinkRef = useRef();

  const [stockName, setStockName] = useState("");
  const [allowedStocks, setAllowedStocks] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [totalEquipments, setTotalEquipments] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [filters, setFilters] = useState({
    nome: "", marca: "", categoria: "", tombamento: "",
    modelo: "", status: location.state?.status || "",
    ip: "", serialnumber: "",
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  const fetchAllFilteredData = async () => {
    const params = {
      estoque: estoqueId,
      ...filters,
    };
    Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);
    const response = await api.get("equipments/", { params: { ...params, page_size: totalEquipments || 1000 } });
    return response.data.results || [];
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    showNotification("A preparar a exportação CSV... Por favor, aguarde.", "info");
    try {
      const allEquipments = await fetchAllFilteredData();
      const formattedData = allEquipments.map(eq => ({
        Fornecedor: eq.nome, Marca: eq.marca, Modelo: eq.modelo,
        Tombamento: eq.tombamento, Categoria: eq.categoria, SerialNumber: eq.serialnumber,
        IP: eq.ip, Status: eq.status,
      }));
      setExportData(formattedData);
      setTimeout(() => {
        csvLinkRef.current.link.click();
        setIsExporting(false);
      }, 500);
    } catch (error) {
      showNotification("Ocorreu um erro ao preparar a exportação CSV.", "error");
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    showNotification("A gerar o PDF... Por favor, aguarde.", "info");
    try {
      const allEquipments = await fetchAllFilteredData();
      
      const doc = new jsPDF();
      doc.text(`Relatório de Equipamentos: ${stockName}`, 14, 16);

      const tableColumn = ["Fornecedor", "Marca", "Modelo", "Tombamento", "Serial", "Status"];
      const tableRows = [];

      allEquipments.forEach(eq => {
        const equipmentData = [
          eq.nome || "-",
          eq.marca || "-",
          eq.modelo || "-",
          eq.tombamento || "N/A",
          eq.serialnumber || "-",
          eq.status || "-",
        ];
        tableRows.push(equipmentData);
      });

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Usamos 'autoTable' diretamente no objeto 'doc'
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`equipamentos_${stockName.replace(" ", "_")}_${new Date().toLocaleDateString()}.pdf`);
      setIsExporting(false);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error); // Adiciona um log mais detalhado
      showNotification("Ocorreu um erro ao gerar o PDF.", "error");
      setIsExporting(false);
    }
  };

    const hasManagePermissionLocal = () => hasManagePermission(currentUser);
  const canDeleteLocal = () => canDelete(currentUser);

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

  useEffect(() => {
    if (estoqueId && allowedStocks.length > 0) {
      const estoqueIdNum = Number(estoqueId);
      if (!allowedStocks.includes(estoqueIdNum)) {
        navigate(`/estoque/${allowedStocks[0]}`);
      }
    }
  }, [estoqueId, allowedStocks, navigate]);

  useEffect(() => {
    if (estoqueId) {
      async function fetchEquipments() {
        try {
          const params = {
            estoque: estoqueId,
            page: page,
            page_size: itemsPerPage,
            ...filters,
          };
          Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) {
              delete params[key];
            }
          });

          const response = await api.get("equipments/", { params });
          setEquipments(response.data.results || []);
          setTotalEquipments(response.data.count || 0);

        } catch (error) {
          console.error("Erro ao buscar equipamentos:", error);
          showNotification("Erro ao buscar equipamentos.", "error");
        }
      }
      fetchEquipments();
    }
  }, [estoqueId, page, itemsPerPage, filters, showNotification]);

  useEffect(() => {
    if (estoqueId) {
      async function fetchStockDetail() {
        try {
          const response = await api.get(`estoques/${estoqueId}`);
          setStockName(response.data.nome || response.data.name || "Nome não disponível");
        } catch (error) {
          console.error("Erro ao buscar detalhes do estoque:", error);
          showNotification("Erro ao buscar detalhes do estoque.", "error");
        }
      }
      fetchStockDetail();
    }
  }, [estoqueId, showNotification]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ nome: "", marca: "", categoria: "", tombamento: "", modelo: "", status: "", serialnumber: "", ip: "" });
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setPage(1);
  };

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
      await api.delete(`equipments/${equipmentToDelete}/`);
      showNotification("Equipamento excluído com sucesso!", "success");
      setPage(1);
      const params = { estoque: estoqueId, page: 1, page_size: itemsPerPage, ...filters };
      Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);
      const response = await api.get("equipments/", { params });
      setEquipments(response.data.results || []);
      setTotalEquipments(response.data.count || 0);
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      showNotification("Erro ao excluir equipamento.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  const handleNewEquipment = () => {
    navigate(`/estoque/${estoqueId}/novo-equipamento`);
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case "Ativo": return styles.statusAtivo;
      case "Manutenção": return styles.statusManutencao;
      case "Inativo": return styles.statusInativo;
      case "Substituída": return styles.statusSubstituida;
      case "Backup": return styles.statusBackup;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        Equipamentos: {stockName || "Carregando..."}
      </h2>
  
      <EquipmentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
  
      <div className={styles.actionsContainer}>
        {hasManagePermissionLocal() && (
          <button onClick={handleNewEquipment} className={styles.button}>
            + Adicionar Equipamento
          </button>
        )}
        <div className={styles.exportButtonsWrapper}>
            <button onClick={handleExportCSV} className={styles.exportButton} disabled={isExporting}>
                <DownloadIcon fontSize="small" />
                {isExporting ? "Aguarde..." : "Exportar CSV"}
            </button>
            <button onClick={handleExportPDF} className={styles.exportButton} disabled={isExporting}>
                <DownloadIcon fontSize="small" />
                {isExporting ? "Aguarde..." : "Exportar PDF"}
            </button>
        </div>
      </div>

      <CSVLink
        data={exportData}
        filename={`equipamentos_${stockName.replace(" ", "_")}_${new Date().toLocaleDateString()}.csv`}
        ref={csvLinkRef}
        target="_blank"
        style={{ display: "none" }}
      />
  
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Fornecedor</th>
              <th className={styles.th}>Marca</th>
              <th className={styles.th}>Modelo</th>
              <th className={styles.th}>Tombamento</th>
              <th className={styles.th}>Categoria</th>
              <th className={styles.th}>Serial</th>
              <th className={styles.th}>IP</th>
              <th className={`${styles.th} ${styles.centerAlign}`}>Status</th>
              <th className={`${styles.th} ${styles.centerAlign}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map((equipment) => (
              <tr key={equipment.id}>
                <td className={styles.td}>
                  <span className={styles.equipmentLink} onClick={() => navigate(`/equipamento/${equipment.id}`)}>
                    {equipment.nome}
                  </span>
                </td>
                <td className={styles.td}>{equipment.marca}</td>
                <td className={styles.td}>{equipment.modelo}</td>
                <td className={styles.td}>{equipment.tombamento || <span className={styles.subtleText}>Sem Tombamento</span>}</td>
                <td className={styles.td}>{equipment.categoria}</td>
                <td className={styles.td}>{equipment.serialnumber}</td>
                <td className={styles.td}>{equipment.ip || "Sem IP"}</td> 
                <td className={`${styles.td} ${styles.centerAlign}`}>
                  <span className={`${styles.statusBadge} ${getStatusClass(equipment.status)}`}>
                    {equipment.status}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.centerAlign}`}>
                  {hasManagePermissionLocal() && (
                    <>
                      <button title="Editar Equipamento" className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleEditEquipment(equipment)}>
                        <EditIcon fontSize="small" />
                      </button>
                      {canDeleteLocal() && (
                        <button title="Excluir Equipamento" className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleOpenDeleteDialog(equipment.id)}>
                          <DeleteForeverIcon fontSize="small" />
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
          count={Math.ceil(totalEquipments / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
        />
        <div className={styles.itemsPerPage}>
          <label htmlFor="itemsPerPage">Itens por página:</label>
          <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
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