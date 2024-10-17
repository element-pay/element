"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { fetchOrderStatus } from "../../api/aggregator";
import { PiSpinnerBold, PiCheckCircle } from "react-icons/pi";
import { AnimatePresence } from 'framer-motion';

export default function SellDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactionStatus, setTransactionStatus] = useState('pending');
  const [completedAt, setCompletedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const orderId = searchParams.get('orderId') || '';
  console.log('orderId is:', orderId);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const getOrderStatus = async () => {
      try {
        const orderStatus = await fetchOrderStatus(orderId);
        console.log('Fetched order status:', orderStatus);

        const status = orderStatus.data.status;
        setTransactionStatus(status);
        setCompletedAt(orderStatus.data.updatedAt);

        if (['validated', 'settled', 'refunded'].includes(status)) {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      } finally {
        setLoading(false); // Ensure loading stops even on error
      }
    };

    if (!orderId) {
      console.error('Order ID is missing');
      setLoading(false);
      return;
    }

    // Initial fetch
    getOrderStatus();

    // Polling every 2 seconds
    intervalId = setInterval(getOrderStatus, 2000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [orderId]);

  const handleBackButtonClick = () => {
    router.push('/');
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'fulfilled':
        return 'Payment fulfilled.';
      case 'validated':
        return 'Payment validated successfully.';
      case 'settled':
        return 'Payment settled successfully.';
      case 'refunded':
        return 'Payment was refunded.';
      default:
        return 'Waiting for confirmation...';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>

        <ProgressBar
          steps={[
            { label: 'Details', status: 'completed', number: 1 },
            {
              label: 'Payment',
              status: transactionStatus !== 'pending' ? 'completed' : 'active',
              number: 2,
            },
            {
              label: 'Review',
              status: transactionStatus === 'validated' ? 'completed' : 'upcoming',
              number: 3,
            },
          ]}
          currentStep={2}
        />

        <h2>Transaction Status</h2>

        <div className={styles.statusContainer}>
          <AnimatePresence mode="wait">
            {loading ? (
              <div className={styles.spinner}>
                <PiSpinnerBold className="animate-spin text-3xl text-orange-500" />
                <p>Loading transaction status...</p>
              </div>
            ) : transactionStatus === 'pending' || transactionStatus === 'processing' ? (
              <div className={styles.spinner}>
                <PiSpinnerBold className="animate-spin text-3xl text-orange-500" />
                <p>{getStatusMessage()}</p>
              </div>
            ) : (
              <div className={styles.completed}>
                <PiCheckCircle className="text-4xl text-green-500" />
                <p>{getStatusMessage()}</p>
              </div>
            )}
          </AnimatePresence>

          <div className={styles.warning}>
            <p>
              {transactionStatus === 'refunded'
                ? `Your payment was unsuccessful, and it has been refunded. Please try again.`
                : `The transaction is being processed. This might take a few seconds.`}
            </p>
          </div>

          {['validated', 'settled', 'refunded'].includes(transactionStatus) && (
            <button onClick={handleBackButtonClick} className={styles.nextButton}>
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
