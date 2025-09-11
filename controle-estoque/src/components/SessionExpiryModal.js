// SessionExpiryModal.jsx
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const SessionExpiryModal = ({ open, remainingSeconds, onRenew, onLogout }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Sessão prestes a expirar</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sua sessão expira em {remainingSeconds} segundos. Deseja renovar sua sessão?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="error">
          Sair
        </Button>
        <Button onClick={onRenew} color="primary" autoFocus>
          Renovar Sessão
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiryModal;
