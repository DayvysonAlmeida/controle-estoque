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
        username: "", nome: "", email: "", funcao: "", role: "", estoques: [], groups_ids: [],
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [availableStocks, setAvailableStocks] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [showResetModal, setShowResetModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, stocksRes, groupsRes] = await Promise.all([
                    api.get(`users/${userId}/`),
                    api.get("estoques/"),
                    api.get("groups/")
                ]);
                const stocksData = stocksRes.data.results || stocksRes.data;
                setAvailableStocks(Array.isArray(stocksData) ? stocksData : []);
                const groupsData = groupsRes.data.results || groupsRes.data;
                setAvailableGroups(Array.isArray(groupsData) ? groupsData : []);
                const { estoques = [], groups = [] } = userRes.data;
                setUserData({
                    ...userRes.data,
                    estoques: estoques.map(s => s.id || s),
                    groups_ids: groups.map(g => g.id || g),
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

    const handleGroupCheckboxChange = (e) => {
        const value = Number(e.target.value);
        const checked = e.target.checked;
        setUserData((prev) => {
            let newGroups = prev.groups_ids || [];
            if (checked && !newGroups.includes(value)) {
                newGroups = [...newGroups, value];
            } else if (!checked) {
                newGroups = newGroups.filter((id) => id !== value);
            }
            return { ...prev, groups_ids: newGroups };
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
                    {/* ... (outros campos: email, funcao, role) ... */}
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
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Grupos de Permissão</label>
                        <div className={styles.checkboxContainer}>
                            {availableGroups.map((group) => (
                                <div key={group.id} className={styles.checkboxItem}>
                                    <input type="checkbox" id={`group-${group.id}`} value={group.id} checked={(userData.groups_ids || []).includes(group.id)} onChange={handleGroupCheckboxChange} />
                                    <label htmlFor={`group-${group.id}`}>{group.name}</label>
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