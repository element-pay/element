"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import styles from './ConnectWalletButton.module.css';

const ConnectWalletButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleClick = () => {
    // JOSE TO IMPLEMENT THIS
    setIsConnected(!isConnected);
  };

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.connectWalletButton} ${isConnected ? styles.connected : ''}`}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faWallet} className={styles.icon} />
        {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default ConnectWalletButton;