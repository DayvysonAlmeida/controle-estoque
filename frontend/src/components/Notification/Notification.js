// src/components/Notification/Notification.js
import React from "react";
import styles from "./Notification.module.css";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

const iconMap = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
};

const Notification = ({ message, severity, onClose }) => {
  return (
    <div className={`${styles.notification} ${styles[severity]}`} onClick={onClose}>
      <div className={styles.iconContainer}>
        {iconMap[severity]}
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Notification;