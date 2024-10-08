"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  const amount = searchParams.get('amount');
  const token = searchParams.get('token');
  const network = searchParams.get('network');
  const receiveCurrency = searchParams.get('receiveCurrency');
  const receiveAmount = searchParams.get('receiveAmount');
  const offrampType = searchParams.get('offrampType');
  const phone = searchParams.get('phone');
  const bank = searchParams.get('bank');
  const account = searchParams.get('account');
  const memo = searchParams.get('memo');

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
          <p><strong>You are selling:</strong> {amount} {token} ({network})</p>
          <p><strong>You will receive:</strong> {receiveAmount} {receiveCurrency}</p>
          <p><strong>Off-ramp type:</strong> {offrampType === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}</p>
          {offrampType === 'mobile' ? (
            <p><strong>Mobile Money Number:</strong> {phone}</p>
          ) : (
            <>
              <p><strong>Bank:</strong> {bank}</p>
              <p><strong>Account Number:</strong> {account}</p>
              {memo && <p><strong>Memo:</strong> {memo}</p>}
            </>
          )}
        </div>
        <Link href="/sell/process" className={styles.nextButton}>
          Next: Enter Details
        </Link>
      </div>
    </div>
  );
}