import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SellLogin() {
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <h2>Login</h2>
        <input type="text" placeholder="Enter your phone number" className={styles.input} />
        <Link href="/sell/details" className={styles.nextButton}>
          Next: Enter Details
        </Link>
      </div>
    </div>
  );
}