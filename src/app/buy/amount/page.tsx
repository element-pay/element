"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import MenuButton from '../../../components/MenuButton/MenuButton';

export default function BuyAmount() {
  const [amount, setAmount] = useState('1582');
  const [receiveAmount, setReceiveAmount] = useState('10');

  const steps = [
    { label: 'Amount', status: 'active' as 'active', number: 1 },
    { label: 'Wallet', status: 'upcoming' as 'upcoming', number: 2 },
    { label: 'Review', status: 'upcoming' as 'upcoming', number: 3 },
    { label: 'Order', status: 'upcoming' as 'upcoming', number: 4 }
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    // You would typically calculate the receive amount based on the exchange rate here
    setReceiveAmount((parseFloat(e.target.value) / 158.2).toFixed(2));
  };

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.logo}>Element<span>Pay</span></div>
          <div className={styles.tabs}>
            <button className={styles.activeTab}>Buy USDC</button>
            <button>
              <Link href="/sell/amount">Sell USDC</Link>
            </button>
          </div>
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={1} />
        <div className={styles.content}>
          <div className={styles.paymentMethod}>
            <span>Payment method:</span>
            <button className={styles.methodButton}>M-PESA</button>
          </div>
          <div className={styles.mobileCarrier}>
            <span>Mobile carrier:</span>
            <button className={styles.carrierButton}>Safaricom Kenya</button>
          </div>
          <div className={styles.exchange}>
            <div className={styles.inputGroup}>
              <label>You Pay</label>
              <input type="text" value={amount} onChange={handleAmountChange} />
              <span className={styles.currency}>KES</span>
            </div>
            <div className={styles.inputGroup}>
              <label>You Receive</label>
              <input type="text" value={receiveAmount} readOnly />
              <span className={styles.currency}>USDC</span>
            </div>
          </div>
          <div className={styles.rate}>
            1 USDC = 130.2 KES
            <span className={styles.updateTime}>Quote updates in 21s</span>
          </div>
          <div className={styles.fee}>
            Estimated Fee <span className={styles.feeAmount}>0.31 USDC</span>
          </div>
          <Link href={`/buy/wallet?amount=${amount}&receiveAmount=${receiveAmount}`} className={styles.nextButton}>
            Next: Specify your wallet
          </Link>
        </div>
      </div>
    </div>
  );
}