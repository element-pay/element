"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { useSimpleOrderHandler } from '@/app/utils/contractUtils';
import { ethers } from 'ethers';
import { createOrder, depositUSDC, withdrawUSDC, settleOrder, getOrder } from '../../utils/contractUtils';

const steps = [
  { label: 'Amount', status: 'completed' as 'completed', number: 1 },
  { label: 'Review', status: 'active' as 'active', number: 2 },
  { label: 'Process', status: 'upcoming' as 'upcoming', number: 3 },
  { label: 'Status', status: 'upcoming' as 'upcoming', number: 4 },
];

export default function SellReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createOrder, depositUSDC, withdrawUSDC, settleOrder, getOrder } = useSimpleOrderHandler();

  // Get all possible parameters
  const amount = searchParams.get('amount');
  const token = searchParams.get('token');
  const network = searchParams.get('network');
  const receiveCurrency = searchParams.get('receiveCurrency');
  const receiveAmount = searchParams.get('receiveAmount');
  const offrampType = searchParams.get('offrampType');
  
  // Bank transfer specific parameters
  const bank = searchParams.get('bank');
  const account = searchParams.get('account');
  const memo = searchParams.get('memo');
  
  // Mobile money specific parameter
  const phone = searchParams.get('phone');

  const [gatewayStatus, setGatewayStatus] = useState('inactive');
  const [orderStatus, setOrderStatus] = useState('inactive');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    setGatewayStatus('active');

    try {
      // Step 1: Call the createOrder function from the contract
      if (amount) {
        console.log('Calling createOrder function...');
        const orderTx = await createOrder(searchParams.get('walletAddress') || '', ethers.utils.parseUnits(amount, 18));
        console.log('Order transaction:', orderTx);
      }

      setGatewayStatus('completed');

      setOrderStatus('active');
      await new Promise(resolve => setTimeout(resolve, 5000));
      setOrderStatus('completed');

      // Navigate to status page
      router.push('/sell/status');
    } catch (error) {
      console.error("Error processing transaction:", error);
      setGatewayStatus('inactive');
      setOrderStatus('inactive');
    }

    setIsProcessing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />

        <h2>Review Transaction Details</h2>
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
            <span className={styles.reviewLabel}>Payment Method:</span>
            <span>{offrampType === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}</span>
          </div>

          {offrampType === 'mobile' ? (
            // Mobile Money Details
            <div className={styles.paymentDetails}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Mobile Money Number:</span>
                <span>{phone}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Network Provider:</span>
                <span>{receiveCurrency === 'UGX' ? 'MTN/Airtel Uganda' : 
                       receiveCurrency === 'KES' ? 'M-PESA Kenya' : 
                       'Mobile Money Ghana'}</span>
              </div>
            </div>
          ) : (
            // Bank Transfer Details
            <div className={styles.paymentDetails}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Bank Name:</span>
                <span>{decodeURIComponent(bank || '')}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Account Number:</span>
                <span>{account}</span>
              </div>
              {memo && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Transfer Memo:</span>
                  <span>{memo}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.warning}>
          <p>Please verify all details carefully. Transactions cannot be reversed once confirmed.</p>
          <p>Failed transactions due to incorrect details may incur a refund fee.</p>
        </div>

        <div className={styles.confirmationSteps}>
          <h3>Confirmation Steps</h3>
          <p>Your wallet will request two permissions to complete this transaction:</p>
          
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[gatewayStatus]}`}></div>
            <span className={`${styles.stepText} ${gatewayStatus === 'inactive' ? styles.inactive : ''}`}>
              1. Approve Gateway Permission
            </span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[orderStatus]}`}></div>
            <span className={`${styles.stepText} ${orderStatus === 'inactive' ? styles.inactive : ''}`}>
              2. Create Order Transaction
            </span>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          className={`${styles.nextButton} ${isProcessing ? styles.processing : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm Transaction'}
        </button>
      </div>
    </div>
  );
}