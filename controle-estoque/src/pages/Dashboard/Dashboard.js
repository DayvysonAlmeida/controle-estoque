import React, { useEffect, useState } from "react";
import { useTheme } from "../../theme/theme";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../../services/api";
import styles from "./Dashboard.module.css";

// Registra os componentes necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { colors } = useTheme();

  // Estados para os dados
  const [profile, setProfile] = useState(null);
  const [estoques, setEstoques] = useState([]);
  // Armazena o objeto do estoque selecionado (com id e nome)
  const [selectedStock, setSelectedStock] = useState(null);
  const [allEquipmentsByStock, setAllEquipmentsByStock] = useState({});

  // Busca os dados do perfil (incluindo estoques)
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await api.get("profile/");
        const profileData = profileRes.data;
        setProfile(profileData);

        if (Array.isArray(profileData.estoques)) {
          // Converte cada item para um objeto com { id, nome }
          const userStocks = profileData.estoques.map((stock) => ({
            id: stock.id || stock,
            nome: stock.nome || `Estoque ${stock}`
          }));
          setEstoques(userStocks);

          if (userStocks.length > 0 && !selectedStock) {
            // Seleciona automaticamente o primeiro estoque da lista
            setSelectedStock(userStocks[0]);
          }
        } else {
          console.warn("Formato inesperado de estoques:", profileData.estoques);
          setEstoques([]);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };

    fetchProfileData();
  }, []);

  // Busca todos os equipamentos e os agrupa pelo estoque (usando o id do estoque)
  useEffect(() => {
    const fetchEquipmentsData = async () => {
      try {
        const response = await api.get("equipments/");
        const equipmentsData = response.data.results || response.data;

        const groupedEquipments = estoques.reduce((acc, estoque) => {
          acc[estoque.id] = equipmentsData.filter((eq) => {
            // Se o equipamento vier com o objeto de estoque, compara pelo id; senão, compara diretamente
            if (eq.estoque && typeof eq.estoque === "object") {
              return eq.estoque.id === estoque.id;
            }
            return eq.estoque === estoque.id;
          });
          return acc;
        }, {});

        setAllEquipmentsByStock(groupedEquipments);
      } catch (error) {
        console.error("Erro ao buscar equipamentos:", error);
      }
    };

    if (estoques.length > 0) {
      fetchEquipmentsData();
    }
  }, [estoques]);

  // Obtém os equipamentos do estoque selecionado
  const equipments = selectedStock
    ? allEquipmentsByStock[selectedStock.id] || []
    : [];

  // Cálculo das métricas para o estoque selecionado
  const totalEquipments = equipments.length;
  const activeEquipments = equipments.filter((eq) => eq.status === "Ativo").length;
  const maintenanceEquipments = equipments.filter((eq) => eq.status === "Manutenção").length;
  const inactiveEquipments = equipments.filter((eq) => eq.status === "Inativo").length;

  // Dados para o gráfico de barras (equipamentos por status)
  const barChartData = {
    labels: ["Ativo", "Manutenção", "Inativo"],
    datasets: [
      {
        label: "Equipamentos por Status",
        data: [activeEquipments, maintenanceEquipments, inactiveEquipments],
        backgroundColor: [
          colors.chartcolor1,
          colors.chartcolor2,
          colors.chartcolor3,
        ],
      },
    ],
  };

  // Cálculo dos totais por estoque usando os equipamentos de todos os estoques
  const equipmentCountByStock = estoques.map((estoque) => {
    return allEquipmentsByStock[estoque.id]?.length || 0;
  });

  // Dados para o gráfico de pizza (distribuição de equipamentos por estoque)
  const pieChartData = {
    labels: estoques.map((estoque) => estoque.nome),
    datasets: [
      {
        data: equipmentCountByStock,
        backgroundColor: estoques.map(
          (_, index) => colors[`chartcolor${index + 1}`]
        ),
      },
    ],
  };

  if (!profile) {
    return (
      <p className={styles.loading} style={{ color: colors.text }}>
        Carregando...
      </p>
    );
  }

  return (
    <div
      className={styles.dashboardContainer}
      style={{ backgroundColor: colors.background }}
    >
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <h1 className={styles.dashboardTitle} style={{ color: colors.textprimary }}>
            Dashboard - {selectedStock?.nome || "Selecione um Estoque"}
          </h1>
          <p className={styles.welcomeMessage} style={{ color: colors.text }}>
            Bem-vindo, {profile.nome}!
          </p>
          {estoques.length > 1 && (
            <select
              value={selectedStock?.nome}
              onChange={(e) => {
                const nomeSelecionado = e.target.value;
                const stock = estoques.find((s) => s.nome === nomeSelecionado);
                setSelectedStock(stock);
              }}
              style={{
                marginTop: "1rem",
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.background,
                color: colors.text,
              }}
            >
              {estoques.map((estoque) => (
                <option key={estoque.id} value={estoque.nome}>
                  {estoque.nome}
                </option>
              ))}
            </select>
          )}
        </header>

        <section className={styles.metrics}>
          <div className={styles.card} style={{ backgroundColor: colors.chartcolor5 }}>
            <h3 className={styles.cardTitle}>Total de Equipamentos</h3>
            <p className={styles.cardValue}>{totalEquipments}</p>
          </div>
          <div className={styles.card} style={{ backgroundColor: colors.chartcolor4 }}>
            <h3 className={styles.cardTitle}>Equipamentos Ativos</h3>
            <p className={styles.cardValue}>{activeEquipments}</p>
          </div>
          <div className={styles.card} style={{ backgroundColor: colors.chartcolor3 }}>
            <h3 className={styles.cardTitle}>Em Manutenção</h3>
            <p className={styles.cardValue}>{maintenanceEquipments}</p>
          </div>
          <div className={styles.card} style={{ backgroundColor: colors.chartcolor2 }}>
            <h3 className={styles.cardTitle}>Inativos</h3>
            <p className={styles.cardValue}>{inactiveEquipments}</p>
          </div>
        </section>

        <section className={styles.charts}>
          <div className={styles.chart}>
            <h3 style={{ color: colors.text }}>Equipamentos por Status</h3>
            <Bar key={`bar-${selectedStock?.id}`} data={barChartData} />
          </div>
          <div className={styles.chart} style={{ height: "300px" }}>
            <h3 style={{ color: colors.text }}>Equipamentos por Estoque</h3>
            <Pie key={`pie-${selectedStock?.id}`} data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
