"use client";

import React, { useRef, useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'upcoming';
  number: number;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  const [progressWidth, setProgressWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const calculateProgress = () => {
      const activeIndex = steps.findIndex(step => step.status === 'active');
      const completedSteps = steps.filter(step => step.status === 'completed').length;
      
      if (stepsRef.current.length < 2) return 0;
      
      const firstCircle = stepsRef.current[0];
      const lastCircle = stepsRef.current[stepsRef.current.length - 1];
      
      if (!firstCircle || !lastCircle) return 0;

      const totalWidth = lastCircle.offsetLeft - firstCircle.offsetLeft;
      
      if (activeIndex === -1) {
        return (completedSteps / (steps.length - 1)) * totalWidth;
      }

      const activeCircle = stepsRef.current[activeIndex];
      if (!activeCircle) return 0;
      
      return activeCircle.offsetLeft - firstCircle.offsetLeft;
    };

    setProgressWidth(calculateProgress());
    
    window.addEventListener('resize', () => setProgressWidth(calculateProgress()));
    return () => window.removeEventListener('resize', () => setProgressWidth(calculateProgress()));
  }, [steps, currentStep]);

  return (
    <div className={styles.container}>
      <div className={styles.progressContainer} ref={containerRef}>
        <div className={styles.progressTrack} />
        <div 
          className={styles.progressLine} 
          style={{ width: `${progressWidth}px` }}
        />
        
        {steps.map((step, index) => (
  <div
    key={index}
    ref={el => {
      stepsRef.current[index] = el; // Store the element in the ref array
    }} // No need to return anything here, so it implicitly returns void
    className={styles.stepWrapper}
  >
    <div
      className={`${styles.step} ${
        step.status === 'completed' 
          ? styles.completed
          : step.status === 'active'
            ? styles.active
            : ''
      }`}
    >
      {step.status === 'completed' ? (
        <svg className={styles.checkmark} viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      ) : (
        <span>{step.number}</span>
      )}
    </div>
    <span className={styles.stepLabel}>{step.label}</span>
  </div>
))}

      </div>
    </div>
  );
};

export default ProgressBar;