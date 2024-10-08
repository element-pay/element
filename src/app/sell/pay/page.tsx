import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';

export default function SellDetails() {
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        
        
      <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>

        <h2>Enter Details</h2>
        <input type="text" placeholder="Full Name" className={styles.input} />
        <input type="email" placeholder="Email Address" className={styles.input} />
        <Link href="/sell/pay" className={styles.nextButton}>
          Next: Payment
        </Link>
      </div>
    </div>
  );
}