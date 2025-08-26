// src/components/SessionExpiryModal/SessionExpiryModal.js
import React from "react";
import styles from "./SessionExpiryModal.module.css";

const SessionExpiryModal = ({ open, remainingSeconds, onRenew, onLogout, warningTime }) => {
  if (!open) {
    return null;
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingSeconds / warningTime;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.timerContainer}>
          <svg className={styles.progressSvg} width="100" height="100">
            <circle className={styles.progressBg} cx="50" cy="50" r={radius} />
            <circle
              className={styles.progressBar}
              cx="50" cy="50" r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className={styles.timerText}>
            {remainingSeconds}
          </div>
        </div>
        
        <h2 className={styles.heading}>A sua sessão está a expirar</h2>
        
        <p className={styles.text}>
          Por inatividade, a sua sessão será encerrada. Deseja continuar ligado?
        </p>

        <div className={styles.buttonContainer}>
          <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onLogout}>
            Sair
          </button>
          <button className={styles.button} onClick={onRenew} autoFocus>
            Continuar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;