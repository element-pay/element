"use client";

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import styles from './ConnectWalletButton.module.css';

const ConnectWalletButton: React.FC = () => {
  return (
    <div className={styles.container}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openConnectModal,
          openChainModal,
          mounted,
        }) => {
          if (!mounted) {
            return <div>Loading...</div>;
          }

          const connected = account && chain;

          return (
            <div>
              {connected ? (
                <button
                  className={`${styles.connectWalletButton} ${styles.connected}`}
                  onClick={openAccountModal}
                  type="button"
                >
                  <FontAwesomeIcon icon={faWallet} className={styles.icon} />
                  Wallet Connected: {account.displayName}
                </button>
              ) : (
                <button
                  className={styles.connectWalletButton}
                  onClick={openConnectModal}
                  type="button"
                >
                  <FontAwesomeIcon icon={faWallet} className={styles.icon} />
                  Connect Wallet
                </button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default ConnectWalletButton;
