"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { CheckCircle, XCircle } from 'lucide-react';

const steps = [
  { label: 'Amount', status: 'completed' as 'completed', number: 1 },
  { label: 'Wallet', status: 'completed' as 'completed', number: 2 },
  { label: 'Review', status: 'completed' as 'completed', number: 3 },
  { label: 'Status', status: 'active' as 'active', number: 4 },
];

export default function BuyStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSuccess, setIsSuccess] = useState(true); // Default to success
  const [transactionDetails, setTransactionDetails] = useState({
    amount: '',
    receiveAmount: '',
    walletAddress: '',
    transactionId: '',
    timestamp: '',
  });

  useEffect(() => {
    // In a real application, you would fetch the transaction status and details from an API
    // For this example, we'll use the search params and generate some mock data
    const amount = searchParams.get('amount') || '10000';
    const receiveAmount = searchParams.get('receiveAmount') || '70';
    const walletAddress = searchParams.get('walletAddress') || '0x1234...5678';

    setTransactionDetails({
      amount: `${amount} KES`,
      receiveAmount: `${receiveAmount} USDC`,
      walletAddress: walletAddress,
      transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toLocaleString(),
    });

    // Simulate a 5% chance of failure
    setIsSuccess(Math.random() > 0.05);
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={4} />

        <div className={styles.statusContent}>
          {isSuccess ? (
            <div className={styles.successStatus}>
              <CheckCircle size={64} color="#28a745" />
              <h2>Payment Successful</h2>
              <p>Your transaction has been completed successfully.</p>
            </div>
          ) : (
            <div className={styles.failureStatus}>
              <XCircle size={64} color="#dc3545" />
              <h2>Payment Failed</h2>
              <p>We encountered an issue processing your transaction. Please try again.</p>
            </div>
          )}

          <div className={styles.transactionDetails}>
            <h3>Transaction Details</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Amount Paid:</span>
              <span>{transactionDetails.amount}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Received Amount:</span>
              <span>{transactionDetails.receiveAmount}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Wallet Address:</span>
              <span>{transactionDetails.walletAddress}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Transaction ID:</span>
              <span>{transactionDetails.transactionId}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Timestamp:</span>
              <span>{transactionDetails.timestamp}</span>
            </div>
          </div>

          {isSuccess ? (
            <button className={styles.nextButton} onClick={() => router.push('/')}>
              Back to Home
            </button>
          ) : (
            <button className={styles.nextButton} onClick={() => router.back()}>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}