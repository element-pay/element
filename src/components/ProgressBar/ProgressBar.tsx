import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className={styles.progressBar}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${index < currentStep ? styles.completed : ''} ${
            index === currentStep - 1 ? styles.active : ''
          }`}
        >
          <div className={styles.stepNumber}>{index + 1}</div>
          <div className={styles.stepLabel}>{step}</div>
          {index < steps.length - 1 && <div className={styles.connector} />}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;