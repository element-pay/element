"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';

const steps = [
  { label: 'Amount', status: 'completed' as 'completed', number: 1 },
  { label: 'Review', status: 'active' as 'active', number: 2 },
  { label: 'Process', status: 'upcoming' as 'upcoming', number: 3 },
  { label: 'Status', status: 'upcoming' as 'upcoming', number: 4 },
];

export default function SellReview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = searchParams.get('amount');
  const token = searchParams.get('token');
  const network = searchParams.get('network');
  const receiveCurrency = searchParams.get('receiveCurrency');
  const receiveAmount = searchParams.get('receiveAmount');
  const offrampType = searchParams.get('offrampType');
  const phone = searchParams.get('phone');

  const [gatewayStatus, setGatewayStatus] = useState('inactive');
  const [orderStatus, setOrderStatus] = useState('inactive');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    setGatewayStatus('active');
    await new Promise(resolve => setTimeout(resolve, 5000));
    setGatewayStatus('completed');

    setOrderStatus('active');
    await new Promise(resolve => setTimeout(resolve, 5000));
    setOrderStatus('completed');

    router.push('/sell/status');
  };

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />

        <h2>Review</h2>
        <div className={styles.reviewContent}>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You are selling:</span>
            <span>{amount} {token} ({network})</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You will receive:</span>
            <span>{receiveAmount} {receiveCurrency}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Off-ramp type:</span>
            <span>{offrampType === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}</span>
          </div>
          {offrampType === 'mobile' && (
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Mobile Money Number:</span>
              <span>{phone}</span>
            </div>
          )}
        </div>

        <div className={styles.warning}>
          Ensure the details above are correct. Failed transaction due to wrong details may attract a refund fee.
        </div>

        <div className={styles.confirmationSteps}>
          <p>To confirm order, you'll be required to approve these two permissions from your wallet</p>
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[gatewayStatus]}`}></div>
            <span className={`${styles.stepText} ${gatewayStatus === 'inactive' ? styles.inactive : ''}`}>
              Approve Gateway
            </span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[orderStatus]}`}></div>
            <span className={`${styles.stepText} ${orderStatus === 'inactive' ? styles.inactive : ''}`}>
              Create Order
            </span>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          className={`${styles.nextButton} ${isProcessing ? styles.processing : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}