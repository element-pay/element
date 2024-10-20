"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import ConnectWalletButton from '../../../components/ConnectWalletButton/ConnectWalletButton';

export default function BuyWallet() {
  const [walletAddress, setWalletAddress] = useState('');
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const receiveAmount = searchParams.get('receiveAmount');

  const steps = [
    { label: 'Amount', status: 'completed' as 'completed', number: 1 },
    { label: 'Wallet', status: 'active' as 'active', number: 2 },
    { label: 'Review', status: 'upcoming' as 'upcoming', number: 3 },
    { label: 'Order', status: 'upcoming' as 'upcoming', number: 4 }
  ];

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />
        <div className={styles.content}>
          <h2 className={styles.title}>Specify Your Wallet</h2>
          <input 
            type="text" 
            placeholder="Enter wallet address" 
            className={styles.input} 
            value={walletAddress}
            onChange={handleWalletChange}
          />
          <ConnectWalletButton />
          <Link 
            href={`/buy/review?amount=${amount}&receiveAmount=${receiveAmount}&walletAddress=${walletAddress}`} 
            className={styles.nextButton}
          >
            Next: Review
          </Link>
        </div>
      </div>
    </div>
    </Suspense>
  );
}