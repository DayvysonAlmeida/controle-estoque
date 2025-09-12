// src/pages/Dashboard/Dashboard.js
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // --- 1. IMPORTAR O useNavigate ---
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { colors } = useTheme();
  const navigate = useNavigate(); // --- 2. INICIAR O useNavigate ---

  const [profile, setProfile] = useState(null);
  const [estoques, setEstoques] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [allEquipmentsByStock, setAllEquipmentsByStock] = useState({});
  const [loading, setLoading] = useState(true);

  // --- 3. CRIAR A FUNÇÃO DE NAVEGAÇÃO ---
  const handleCardClick = (status) => {
    if (!selectedStock) return; // Não faz nada se nenhum estoque estiver selecionado
    // Navega para a lista de equipamentos, passando o filtro de status no 'state'
    navigate(`/estoque/${selectedStock.id}`, {
      state: { status: status },
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileRes = await api.get("profile/");
        const profileData = profileRes.data;
        setProfile(profileData);

        const userStockIds = profileData.estoques || [];
        if (userStockIds.length > 0) {
          const stocksRes = await api.get("estoques/");
          const allStocks = stocksRes.data.results || stocksRes.data;
          
          const userStocks = allStocks
            .filter(stock => userStockIds.includes(stock.id))
            .map(stock => ({ id: stock.id, nome: stock.nome || stock.name }));

          setEstoques(userStocks);
          if (userStocks.length > 0) {
            setSelectedStock(userStocks[0]);
          }

          const equipmentsRes = await api.get("equipments/");
          const equipmentsData = equipmentsRes.data.results || equipmentsRes.data;
          
          const groupedEquipments = userStocks.reduce((acc, estoque) => {
            acc[estoque.id] = equipmentsData.filter(eq => (eq.estoque?.id || eq.estoque) === estoque.id);
            return acc;
          }, {});
          setAllEquipmentsByStock(groupedEquipments);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const metrics = useMemo(() => {
    const equipments = selectedStock ? allEquipmentsByStock[selectedStock.id] || [] : [];
    const getCount = (status) => equipments.filter(eq => eq.status === status).length;
    return {
      total: equipments.length,
      ativo: getCount("Ativo"),
      manutencao: getCount("Manutenção"),
      inativo: getCount("Inativo"),
      substituida: getCount("Substituída"),
      backup: getCount("Backup"),
    };
  }, [selectedStock, allEquipmentsByStock]);

  const barChartData = {
    labels: ["Ativo", "Manutenção", "Inativo", "Substituído", "Backup"],
    datasets: [
      {
        label: "Equipamentos por Status",
        data: [metrics.ativo, metrics.manutencao, metrics.inativo, metrics.substituida, metrics.backup],
        backgroundColor: [
          colors.chartcolor2,
          colors.chartcolor3,
          colors.textsecondary,
          colors.chartcolor1,
          colors.chartcolor5,
        ],
      },
    ],
  };

  const equipmentCountByStock = estoques.map((estoque) => {
    return allEquipmentsByStock[estoque.id]?.length || 0;
  });

  const pieChartData = {
    labels: estoques.map((estoque) => estoque.nome),
    datasets: [
      {
        data: equipmentCountByStock,
        backgroundColor: estoques.map((_, index) => colors[`chartcolor${(index % 5) + 1}`]),
        borderColor: colors.bgcard,
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.dashboardTitle}>
            Dashboard: {selectedStock?.nome || "Geral"}
          </h1>
          <p className={styles.welcomeMessage}>
            Bem-vindo de volta, {profile?.nome}!
          </p>
        </div>
        {estoques.length > 1 && (
          <select
            className={styles.stockSelector}
            value={selectedStock?.id || ""}
            onChange={(e) => {
              const stock = estoques.find((s) => s.id === Number(e.target.value));
              setSelectedStock(stock);
            }}
          >
            {estoques.map((estoque) => (
              <option key={estoque.id} value={estoque.id}>
                {estoque.nome}
              </option>
            ))}
          </select>
        )}
      </header>

      {/* --- 4. ADICIONAR O onClick AOS CARTÕES --- */}
      <section className={styles.metricsGrid}>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("")}>
          <h3 className={styles.cardTitle}>Total</h3>
          <p className={styles.cardValue}>{metrics.total}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Ativo")}>
          <h3 className={styles.cardTitle}>Ativos</h3>
          <p className={styles.cardValue} style={{ color: colors.chartcolor2 }}>{metrics.ativo}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Manutenção")}>
          <h3 className={styles.cardTitle}>Manutenção</h3>
          <p className={styles.cardValue} style={{ color: colors.chartcolor3 }}>{metrics.manutencao}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Inativo")}>
          <h3 className={styles.cardTitle}>Inativos</h3>
          <p className={styles.cardValue} style={{ color: colors.textsecondary }}>{metrics.inativo}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Substituída")}>
          <h3 className={styles.cardTitle}>Substituídos</h3>
          <p className={styles.cardValue} style={{ color: colors.chartcolor1 }}>{metrics.substituida}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Backup")}>
          <h3 className={styles.cardTitle}>Backup</h3>
          <p className={styles.cardValue} style={{ color: colors.chartcolor5 }}>{metrics.backup}</p>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Equipamentos por Status</h3>
          <div style={{ position: 'relative', height: '100%' }}>
            <Bar data={barChartData} options={{ maintainAspectRatio: false, color: colors.textprimary, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Distribuição por Estoque</h3>
          <div style={{ position: 'relative', height: '100%' }}>
            <Pie data={pieChartData} options={{ maintainAspectRatio: false, color: colors.textprimary, plugins: { legend: { position: 'right', labels: { color: colors.textprimary } } } }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;