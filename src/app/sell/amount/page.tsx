import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SellAmount() {
  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.logo}>ElementPay</div>
          <div className={styles.tabs}>
            <button>
              <Link href="/buy/amount">Buy USDC</Link>
            </button>
            <button className={styles.activeTab}>Sell cUSD</button>
          </div>
          <button className={styles.menuButton}>⋮</button>
        </div>
        <div className={styles.progress}>
          <div className={styles.step + ' ' + styles.active}>Amount</div>
          <div className={styles.step}>Login</div>
          <div className={styles.step}>Details</div>
          <div className={styles.step}>Pay</div>
          <div className={styles.step}>Status</div>
        </div>
        <div className={styles.content}>
          <div className={styles.offrampType}>
            <span>Off-ramp type:</span>
            <div className={styles.typeButtons}>
              <button>Airtime</button>
              <button className={styles.activeType}>Mobile money</button>
            </div>
          </div>
          <div className={styles.exchange}>
            <div className={styles.inputGroup}>
              <label>You Pay</label>
              <input type="text" value="10" />
              <span className={styles.currency}>cUSD</span>
              <span className={styles.networkBadge}>CELO</span>
            </div>
            <div className={styles.inputGroup}>
              <label>You Receive</label>
              <input type="text" value="33944" />
              <span className={styles.currency}>UGX</span>
              <span className={styles.flagBadge}>UG</span>
            </div>
          </div>
          <div className={styles.rate}>
            1 cUSD = 3481.4359 UGX
            <span className={styles.updateTime}>Quote updates in 29s</span>
          </div>
          <div className={styles.fee}>
            Estimated Fee <span className={styles.feeAmount}>0.25 cUSD</span>
          </div>
          <Link href="/sell/login" className={styles.nextButton}>
            Next: Verify your phone
          </Link>
        </div>
      </div>
    </div>
  );
}