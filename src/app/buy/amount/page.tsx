import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function BuyAmount() {
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.logo}>ElementPay</div>
          <div className={styles.tabs}>
            <button className={styles.activeTab}>Buy USDC</button>
            <button>
              <Link href="/sell/amount">Sell USDC</Link>
            </button>
          </div>
          <button className={styles.menuButton}>⋮</button>
        </div>
        <div className={styles.progress}>
          <div className={styles.step + ' ' + styles.active}>Amount</div>
          <div className={styles.step}>Wallet</div>
          <div className={styles.step}>Verify</div>
          <div className={styles.step}>Order</div>
        </div>
        <div className={styles.content}>
          <div className={styles.paymentMethod}>
            <span>Payment method:</span>
            <button className={styles.methodButton}>M-PESA</button>
          </div>
          <div className={styles.mobileCarrier}>
            <span>Mobile carrier:</span>
            <button className={styles.carrierButton}>Safaricom Kenya</button>
          </div>
          <div className={styles.exchange}>
            <div className={styles.inputGroup}>
              <label>You Pay</label>
              <input type="text" value="1582" />
              <span className={styles.currency}>KES</span>
            </div>
            <div className={styles.inputGroup}>
              <label>You Receive</label>
              <input type="text" value="10" />
              <span className={styles.currency}>USDC</span>
            </div>
          </div>
          <div className={styles.rate}>
            1 USDC = 153.44 KES
            <span className={styles.updateTime}>Quote updates in 21s</span>
          </div>
          <div className={styles.fee}>
            Estimated Fee <span className={styles.feeAmount}>0.31 USDC</span>
          </div>
          <div className={styles.reward}>
            Your order might be eligible for a reward of 125 cKES
          </div>
          <Link href="/buy/wallet" className={styles.nextButton}>
            Next: Specify your wallet
          </Link>
        </div>
      </div>
    </div>
  );
}