// src/components/EquipmentFilters/EquipmentFilters.jsx
import React, { useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import styles from "./EquipmentFilters.module.css";

const EquipmentFilters = ({ filters, onFilterChange, onClearFilters }) => {
  // Cria uma versão debounced que recebe o nome e o valor do campo
  const debouncedOnFilterChange = useMemo(
    () =>
      debounce((fieldName, fieldValue) => {
        // Cria um objeto similar ao evento para compatibilidade com o handler do componente pai
        onFilterChange({ target: { name: fieldName, value: fieldValue } });
      }, 150), // tempo de buscar o filtro
    [onFilterChange]
  );

  // Cancela as chamadas pendentes do debounce quando o componente desmontar
  useEffect(() => {
    return () => {
      debouncedOnFilterChange.cancel();
    };
  }, [debouncedOnFilterChange]);

  // Handler que extrai os dados do input e chama a função debounced
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    debouncedOnFilterChange(name, value);
  };

  return (
    <div className={styles.filters}>
      <input
        type="text"
        name="nome"
        placeholder="Filtrar por Nome"
        value={filters.nome}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por Nome"
      />
      <input
        type="text"
        name="marca"
        placeholder="Filtrar por Marca"
        value={filters.marca}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por Marca"
      />
      <input
        type="text"
        name="categoria"
        placeholder="Filtrar por Categoria"
        value={filters.categoria}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por Categoria"
      />
      <input
        type="text"
        name="tombamento"
        placeholder="Filtrar por Tombamento"
        value={filters.tombamento}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por Tombamento"
      />
      <input
        type="text"
        name="modelo"
        placeholder="Filtrar por Modelo"
        value={filters.modelo}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por Modelo"
      />
      <select
        name="status"
        value={filters.status}
        onChange={handleInputChange}
        className={styles.select}
        aria-label="Filtrar por Status"
      >
        <option value="">Filtrar por Status</option>
        <option value="Ativo">Ativo</option>
        <option value="Manutenção">Manutenção</option>
        <option value="Inativo">Inativo</option>
      </select>
      <input
        type="text"
        name="serialnumber"
        placeholder="Filtrar por SerialNumber"
        value={filters.serialnumber}
        onChange={handleInputChange}
        className={styles.input}
        aria-label="Filtrar por SerialNumber"
      />
      <button onClick={onClearFilters} className={styles.button}>
        Limpar Filtros
      </button>
    </div>
  );
};

export default React.memo(EquipmentFilters);
