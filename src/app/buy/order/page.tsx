import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function BuyWallet() {
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <h2>Specify Your Wallet</h2>
        <input type="text" placeholder="Enter wallet address" className={styles.input} />
        <Link href="/buy/verify" className={styles.nextButton}>
          Next: Verify
        </Link>
      </div>
    </div>
  );
}