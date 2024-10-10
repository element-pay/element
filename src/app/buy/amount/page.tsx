import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import MenuButton from '../../../components/MenuButton/MenuButton';

export default function BuyAmount() {
  const steps = [
    { label: 'Amount', status: 'active' as 'completed', number: 1 },
    { label: 'Wallet', status: 'upcoming' as 'active', number: 2 },
    { label: 'Verify', status: 'upcoming' as 'upcoming', number: 3 },
    { label: 'Order', status: 'upcoming' as 'upcoming', number: 4 }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.logo}>Element<span>Pay</span></div>
          <div className={styles.tabs}>
            <button className={styles.activeTab}>Buy USDC</button>
            <button>
              <Link href="/sell/amount">Sell USDC</Link>
            </button>
          </div>
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />
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
