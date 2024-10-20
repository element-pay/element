import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Element Pay Easily spend your crypto to local currency and vice versa</h1>
      <div className={styles.buttonContainer}>
        <Link href="/buy/amount" className={styles.button}>Buy Crypto</Link>
        <Link href="/sell/amount" className={styles.button}>Sell Crypto</Link>
      </div>
    </div>
  );
}