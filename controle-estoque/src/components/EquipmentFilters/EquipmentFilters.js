// src/components/EquipmentFilters/EquipmentFilters.jsx
import React from "react";
import styles from "./EquipmentFilters.module.css";
import ClearIcon from '@mui/icons-material/Clear';

const EquipmentFilters = ({ filters, onFilterChange, onClearFilters }) => {
  // A função 'handleInputChange' que causava o aviso foi removida.

  return (
    <div className={styles.filters}>
      <input
        type="text"
        name="nome"
        placeholder="Filtrar por Fornecedor"
        value={filters.nome}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por Fornecedor"
      />
      <input
        type="text"
        name="marca"
        placeholder="Filtrar por Marca"
        value={filters.marca}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por Marca"
      />
      <input
        type="text"
        name="categoria"
        placeholder="Filtrar por Categoria"
        value={filters.categoria}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por Categoria"
      />
      <input
        type="text"
        name="tombamento"
        placeholder="Filtrar por Tombamento"
        value={filters.tombamento}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por Tombamento"
      />
      <input
        type="text"
        name="modelo"
        placeholder="Filtrar por Modelo"
        value={filters.modelo}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por Modelo"
      />
      <input
        type="text"
        name="serialnumber"
        placeholder="Filtrar por SerialNumber"
        value={filters.serialnumber}
        onChange={onFilterChange}
        className={styles.input}
        aria-label="Filtrar por SerialNumber"
      />
      <select
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        className={styles.select}
        aria-label="Filtrar por Status"
      >
        <option value="">Todos os Status</option>
        <option value="Ativo">Ativo</option>
        <option value="Manutenção">Manutenção</option>
        <option value="Inativo">Inativo</option>
        <option value="Substituída">Substituída</option>
        <option value="Backup">Backup</option>
      </select>
      <button onClick={onClearFilters} className={styles.button}>
        <ClearIcon fontSize="small" />
        <span>Limpar</span>
      </button>
    </div>
  );
};

export default React.memo(EquipmentFilters);