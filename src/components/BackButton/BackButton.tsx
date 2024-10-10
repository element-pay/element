"use client";

import { useRouter } from 'next/navigation';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './BackButton.module.css';

const BackButton = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <button className={styles.backButton} onClick={handleBackClick}>
      <FontAwesomeIcon icon={faArrowLeft} className={styles.icon} /> Back
    </button>
  );
};

export default BackButton;
