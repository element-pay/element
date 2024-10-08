"use client"; // Mark the component as a Client Component

import React from 'react';
import Link from 'next/link';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';

export default function BuyWallet() {
  const steps = [
    { label: 'Amount', status: 'completed' as 'completed', number: 1 },
    { label: 'Wallet', status: 'active' as 'active', number: 2 },
    { label: 'Verify', status: 'upcoming' as 'upcoming', number: 3 },
    { label: 'Order', status: 'upcoming' as 'upcoming', number: 4 }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />
        <div className={styles.content}>
          <h2 className={styles.title}>Specify Your Wallet</h2>
          <input type="text" placeholder="Enter wallet address" className={styles.input} />
          <Link href="/buy/verify" className={styles.nextButton}>
            Next: Verify
          </Link>
        </div>
      </div>
    </div>
  );
}
