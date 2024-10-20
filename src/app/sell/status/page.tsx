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

  const [transactionStatus, setTransactionStatus] = useState<string>('pending');
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch `orderId` from URL or Local Storage
  useEffect(() => {
    const queryOrderId = searchParams.get('orderId');
    const storedOrderId = localStorage.getItem('orderId');

    if (queryOrderId) {
      setOrderId(queryOrderId);
    } else if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      console.error('Order ID is missing. Redirecting...');
      router.push('/sell'); // Redirect if no orderId is found
    }
  }, [searchParams, router]);

  // Poll the order status and update UI accordingly
  useEffect(() => {
    if (!orderId) return;

    let intervalId: NodeJS.Timeout;

    const getOrderStatus = async () => {
      try {
        setLoading(true); 
        const orderStatus = await fetchOrderStatus(orderId);

        console.log('Fetched order status:', orderStatus);
        const status = orderStatus.data.status;

        // Update state based on order status
        setTransactionStatus(status);
        setCompletedAt(orderStatus.data.updatedAt);

        if (['validated', 'settled', 'refunded', 'fulfilled'].includes(status)) {
          clearInterval(intervalId); // Stop polling if final status is reached
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      } finally {
        setLoading(false); // Ensure loading stops
      }
    };

    // Initial fetch
    getOrderStatus();

    // Poll every 2 seconds
    intervalId = setInterval(getOrderStatus, 2000);

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, [orderId]);

  const handleBackButtonClick = () => {
    router.push('/'); // Navigate back to the home page
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

  const getWarningMessage = () => {
    if (transactionStatus === 'refunded') {
      return 'Your payment was unsuccessful, and it has been refunded. Please try again.';
    }
    if (['settled', 'validated', 'fulfilled'].includes(transactionStatus)) {
      return 'Your transaction was successful.';
    }
    return 'The transaction is being processed. This might take a few seconds.';
  };

  const getProgressBarStatus = (stepNumber: number) => {
    if (stepNumber === 1) return 'completed';
    if (stepNumber === 2 && transactionStatus !== 'pending') return 'completed';
    if (stepNumber === 3 && ['validated', 'settled', 'fulfilled'].includes(transactionStatus)) {
      return 'completed';
    }
    return 'active';
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
            { label: 'Details', status: getProgressBarStatus(1), number: 1 },
            { label: 'Payment', status: getProgressBarStatus(2), number: 2 },
            { label: 'Review', status: getProgressBarStatus(3), number: 3 },
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
            ) : (
              <div className={styles.completed}>
                <PiCheckCircle className="text-4xl text-green-500" />
                <p>{getStatusMessage()}</p>
                {completedAt && <p>Completed at: {new Date(completedAt).toLocaleString()}</p>}
              </div>
            )}
          </AnimatePresence>

          <div className={styles.warning}>
            <p>{getWarningMessage()}</p>
          </div>

          {['validated', 'settled', 'refunded', 'fulfilled'].includes(transactionStatus) && (
            <button onClick={handleBackButtonClick} className={styles.nextButton}>
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
