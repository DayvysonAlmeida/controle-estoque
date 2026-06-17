// src/pages/UserEdit/UserEdit.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./UserEdit.module.css";
import { useNotification } from "../../contexts/NotificationProvider";

const UserEdit = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [userData, setUserData] = useState({
        username: "", nome: "", email: "", funcao: "", role: "padrao", estoques: [],
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [availableStocks, setAvailableStocks] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, stocksRes] = await Promise.all([
                    api.get(`users/${userId}/`),
                    api.get("estoques/")
                ]);
                const stocksData = stocksRes.data.results || stocksRes.data;
                setAvailableStocks(Array.isArray(stocksData) ? stocksData : []);
                const { estoques = [] } = userRes.data;
                setUserData({
                    ...userRes.data,
                    estoques: estoques.map(s => s.id || s),
                });
            } catch (error) {
                showNotification("Falha ao carregar dados do utilizador.", "error");
            }
        };
        fetchInitialData();
    }, [userId, showNotification]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleCheckboxChange = (e) => {
        const value = Number(e.target.value);
        const checked = e.target.checked;
        setUserData((prev) => {
            const { estoques } = prev;
            if (checked && !estoques.includes(value)) {
                return { ...prev, estoques: [...estoques, value] };
            }
            if (!checked) {
                return { ...prev, estoques: estoques.filter((id) => id !== value) };
            }
            return prev;
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        const payload = { ...userData };
        delete payload.password;
        try {
            await api.patch(`users/${userId}/`, payload);
            showNotification("Utilizador atualizado com sucesso!", "success");
            navigate("/usuarios");
        } catch (error) {
            if (error.response?.data) {
                setFieldErrors(error.response.data);
                showNotification("Por favor, corrija os erros no formulário.", "error");
            } else {
                showNotification("Ocorreu um erro de rede. Tente novamente.", "error");
            }
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification("As senhas não conferem.", "error");
            return;
        }
        try {
            await api.patch(`users/${userId}/`, { password: passwordData.newPassword });
            showNotification("Senha atualizada com sucesso!", "success");
            setShowResetModal(false);
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error) {
            showNotification("Erro ao atualizar a senha.", "error");
        }
    };

    return (
        <>
            <div className={styles.container}>
                <h2 className={styles.heading}>Editar Utilizador: {userData.username}</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome de Utilizador</label>
                            <input type="text" name="username" value={userData.username} onChange={handleChange} required className={`${styles.input} ${fieldErrors.username ? styles.inputError : ""}`} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome Completo</label>
                            <input type="text" name="nome" value={userData.nome} onChange={handleChange} required className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ""}`} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input type="email" name="email" value={userData.email} onChange={handleChange} required className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Função (Cargo)</label>
                            <input type="text" name="funcao" value={userData.funcao || ""} onChange={handleChange} className={`${styles.input} ${fieldErrors.funcao ? styles.inputError : ""}`} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nível de Acesso (Role)</label>
                            <select name="role" value={userData.role} onChange={handleChange} required className={`${styles.input} ${fieldErrors.role ? styles.inputError : ""}`}>
                                <option value="leitor">Leitor (Apenas Visualizar)</option>
                                <option value="padrao">Padrão (Criar/Editar)</option>
                                <option value="admin">Administrador (Acesso Total)</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Acesso aos Estoques</label>
                        <div className={styles.checkboxContainer}>
                            {availableStocks.map((stock) => (
                                <div key={stock.id} className={styles.checkboxItem}>
                                    <input type="checkbox" id={`stock-${stock.id}`} value={stock.id} checked={userData.estoques.includes(stock.id)} onChange={handleCheckboxChange} />
                                    <label htmlFor={`stock-${stock.id}`}>{stock.nome}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button type="button" className={`${styles.button} ${styles.passwordButton}`} onClick={() => setShowResetModal(true)}>
                            Redefinir Senha
                        </button>
                        <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.button}>
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
            {showResetModal && (
                <div className={styles.modalOverlay}>
                    <form onSubmit={handleResetPassword} className={styles.modalContent}>
                       <h3 className={styles.heading}>Redefinir Senha</h3>
                       <div className={styles.formGroup}>
                         <label className={styles.label}>Nova Senha</label>
                         <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className={styles.input} />
                       </div>
                       <div className={styles.formGroup}>
                         <label className={styles.label}>Confirmar Nova Senha</label>
                         <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className={styles.input} />
                       </div>
                       <div className={styles.modalButtons}>
                         <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setShowResetModal(false)}>
                           Cancelar
                         </button>
                         <button type="submit" className={styles.button}>
                           Salvar Senha
                         </button>
                       </div>
                    </form>
                </div>
            )}
        </>
    );
};
export default UserEdit;