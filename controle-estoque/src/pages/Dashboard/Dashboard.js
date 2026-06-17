// src/pages/Dashboard/Dashboard.js
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { useTheme } from "../../theme/theme";
import { Bar, Pie } from "react-chartjs-2";
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SaveIcon from '@mui/icons-material/Save';
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
  const [metrics, setMetrics] = useState({
      total: 0, ativo: 0, manutencao: 0, inativo: 0, substituida: 0, backup: 0, por_estoque: []
  });
  const [loading, setLoading] = useState(true);

  // --- 3. CRIAR A FUNÇÃO DE NAVEGAÇÃO ---
  const handleCardClick = (status) => {
    if (!selectedStock) return; 
    navigate(`/estoque/${selectedStock.id}`, {
      state: { status: status },
    });
  };

  // Busca perfil e estoques iniciais
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
            setSelectedStock(userStocks[0]); // Isso engatilhará o fetch das métricas
          } else {
             setLoading(false);
          }
        } else {
             setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Busca as métricas dinâmicas via Backend (Leve e rápido)
  useEffect(() => {
     const fetchMetrics = async () => {
         if (!selectedStock) return;
         try {
             setLoading(true);
             const res = await api.get(`dashboard-metrics/?estoque=${selectedStock.id}`);
             setMetrics(res.data);
         } catch (error) {
             console.error("Erro ao buscar métricas:", error);
         } finally {
             setLoading(false);
         }
     };
     fetchMetrics();
  }, [selectedStock]);

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

  const pieChartData = {
    labels: metrics.por_estoque.map((e) => e.nome),
    datasets: [
      {
        data: metrics.por_estoque.map((e) => e.total),
        backgroundColor: metrics.por_estoque.map((_, index) => colors[`chartcolor${(index % 5) + 1}`]),
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
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Total</h3>
             <InventoryIcon className={styles.cardIcon} />
          </div>
          <p className={styles.cardValue}>{metrics.total}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Ativo")}>
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Ativos</h3>
             <CheckCircleIcon className={styles.cardIcon} style={{ color: colors.chartcolor2 }} />
          </div>
          <p className={styles.cardValue} style={{ color: colors.chartcolor2 }}>{metrics.ativo}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Manutenção")}>
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Manutenção</h3>
             <BuildIcon className={styles.cardIcon} style={{ color: colors.chartcolor3 }} />
          </div>
          <p className={styles.cardValue} style={{ color: colors.chartcolor3 }}>{metrics.manutencao}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Inativo")}>
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Inativos</h3>
             <CancelIcon className={styles.cardIcon} style={{ color: colors.textsecondary }} />
          </div>
          <p className={styles.cardValue} style={{ color: colors.textsecondary }}>{metrics.inativo}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Substituída")}>
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Substituídos</h3>
             <AutorenewIcon className={styles.cardIcon} style={{ color: colors.chartcolor1 }} />
          </div>
          <p className={styles.cardValue} style={{ color: colors.chartcolor1 }}>{metrics.substituida}</p>
        </div>
        <div className={`${styles.card} ${styles.clickableCard}`} onClick={() => handleCardClick("Backup")}>
          <div className={styles.cardHeader}>
             <h3 className={styles.cardTitle}>Backup</h3>
             <SaveIcon className={styles.cardIcon} style={{ color: colors.chartcolor5 }} />
          </div>
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