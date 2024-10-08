import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';

export default function VerifyPhone() {
  const steps = [
    { label: 'Amount', status: 'completed' as 'completed', number: 1 },
    { label: 'Wallet', status: 'completed' as 'completed', number: 2 },
    { label: 'Verify', status: 'active' as 'active', number: 3 },
    { label: 'Order', status: 'upcoming' as 'upcoming', number: 4 }
  ];

  
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={3} />
        <div className={styles.content}>
          <h2 className={styles.title}>Verify Your Phone Number</h2>
          <label className={styles.inputLabel}>Your Phone Number</label>
          <div className={styles.phoneInput}>
            <span className={styles.flag}>🇰🇪</span>
            <span className={styles.countryCode}>+254</span>
            <input type="tel" className={styles.phoneNumber} placeholder="Enter phone number" />
          </div>
          <Link href="/login" className={styles.loginLink}>
            Log in with password
          </Link>
          <button className={styles.nextButton}>
            Next: Phone Verification
          </button>
        </div>
      </div>
    </div>
  );
}
