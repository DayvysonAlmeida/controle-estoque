import * as React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";
import Group from "@mui/icons-material/Group";
import { useTheme } from "../../theme/theme";
import api from "../../services/api";
import styles from "./AccountMenu.module.css";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { colors } = useTheme();

  // Estado para armazenar o nome do usuário logado
  const [userName, setUserName] = React.useState("");

  // Busca o perfil do usuário e atualiza o estado com o nome
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("profile/");
        // Supondo que o endpoint retorne um objeto com a propriedade 'nome'
        setUserName(response.data.nome);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    }
    fetchProfile();
  }, []);

  // Função para checar se o usuário é Administrador
  const isAdmin = () => {
    const storedProfile = localStorage.getItem("userProfile");
    if (!storedProfile) return false;
    try {
      const userProfile = JSON.parse(storedProfile);
      // Se estiver marcado como superusuário, retorna true
      if (userProfile.is_superuser) return true;
      if (userProfile.groups && Array.isArray(userProfile.groups)) {
        // Verifica se algum dos objetos de grupo tem name igual a "Administrador"
        return userProfile.groups.some((group) => group.name === "Administrador");
      }
      return false;
    } catch (error) {
      console.error("Erro ao parsear userProfile do localStorage:", error);
      return false;
    }
  };
  

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddUser = () => {
    handleClose();
    navigate("/usuarios/novo");
  };

  const handleManageUsers = () => {
    handleClose();
    navigate("/usuarios");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleClose();
    navigate("/settings");
  };

  const handleLogout = () => {
    handleClose();
    navigate("/");
  };

  return (
    <Box className={styles.accountMenuContainer}>
      <Box
        className={styles.accountMenuBox}
        sx={{
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <Typography className={styles.accountMenuText}>
          👋 Bem-vindo, {userName || "Usuário"}
        </Typography>
        <Tooltip title="Configurações da Conta">
          <IconButton
            onClick={handleClick}
            size="small"
            className={styles.accountMenuButton}
            sx={{
              backgroundColor: colors.buttonBackground,
              color: colors.buttonText,
              "&:hover": {
                backgroundColor: colors.hoverBackground,
              },
            }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>
              {userName ? userName[0] : "A"}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: colors.background,
              color: colors.text,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
                bgcolor: colors.primary,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: colors.background,
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Perfil
        </MenuItem>
        {/* Itens apenas para usuários administradores */}
        {isAdmin() && (
          <>
            <MenuItem onClick={handleManageUsers}>
              <ListItemIcon>
                <Group fontSize="small" />
              </ListItemIcon>
              Gerenciar Usuários
            </MenuItem>
            <MenuItem onClick={handleAddUser}>
              <ListItemIcon>
                <PersonAdd fontSize="small" />
              </ListItemIcon>
              Adicionar Usuário
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configurações
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
