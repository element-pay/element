'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ConnectWalletButton from '../../../components/ConnectWalletButton/ConnectWalletButton';

interface Token {
  symbol: string;
  name: string;
  network: string;
  rate: number;
}

interface Bank {
  id: string;
  name: string;
  code: string;
}

const tokens: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', network: 'BASE', rate: 3481.4359 },
  { symbol: 'cUSD', name: 'Celo Dollar', network: 'CELO', rate: 3481.4359 },
  { symbol: 'USDT', name: 'Tether', network: 'BASE', rate: 3480.2100 },
  { symbol: 'DAI', name: 'Dai', network: 'BASE', rate: 3479.8900 },
];

const receiveOptions = [
  { label: 'UGX', country: 'UG' },
  { label: 'KES', country: 'KE' },
  { label: 'GHS', country: 'GH' },
];

const banks: Bank[] = [
  { id: '1', name: 'Equity Bank', code: 'EQT' },
  { id: '2', name: 'KCB Bank', code: 'KCB' },
  { id: '3', name: 'Standard Chartered', code: 'SCB' },
  { id: '4', name: 'Absa Bank', code: 'ABS' },
  { id: '5', name: 'Co-operative Bank', code: 'COB' },
];

export default function SellAmount() {
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('10');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState(receiveOptions[0]);
  const [isReceiveDropdownOpen, setIsReceiveDropdownOpen] = useState(false);
  const [isMobileMoney, setIsMobileMoney] = useState(true);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const steps = [
    { label: 'Amount', status: 'active' as 'active', number: 1 },
    { label: 'Review', status: 'upcoming' as 'upcoming', number: 2 },
    { label: 'Process', status: 'upcoming' as 'upcoming', number: 3 },
    { label: 'Status', status: 'upcoming' as 'upcoming', number: 4 },
  ];

  const calculateReceivedAmount = (inputAmount: string, rate: number) => {
    const numAmount = parseFloat(inputAmount);
    if (!isNaN(numAmount)) {
      return (numAmount * rate).toFixed(2);
    }
    return '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    setReceivedAmount(calculateReceivedAmount(newAmount, selectedToken.rate));
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setReceivedAmount(calculateReceivedAmount(amount, token.rate));
    setIsDropdownOpen(false);
  };

  const handleReceiveCurrencySelect = (option: { label: string; country: string }) => {
    setReceiveCurrency(option);
    setIsReceiveDropdownOpen(false);
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankId = e.target.value;
    setSelectedBank(selectedBankId);
    const selectedBankName = banks.find(bank => bank.id === selectedBankId)?.name || '';
    setBankName(selectedBankName);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(e.target.value);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemo(e.target.value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };


  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.logo}>Element<span>Pay</span></div>
          <div className={styles.tabs}>
            <button>
              <Link href="/buy/amount">Buy {selectedToken.symbol}</Link>
            </button>
            <button className={styles.activeTab}>Sell {selectedToken.symbol}</button>
          </div>
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={1} />
        <div className={styles.content}>
        <ConnectWalletButton />
          <div className={styles.offrampType}>
            <span>Off-ramp type:</span>
            <div className={styles.typeButtons}>
              <button 
                className={!isMobileMoney ? styles.active : ''} 
                onClick={() => setIsMobileMoney(false)}
              >
                Bank Transfer
              </button>
              <button 
                className={isMobileMoney ? styles.active : ''} 
                onClick={() => setIsMobileMoney(true)}
              >
                Mobile money
              </button>
              <div className={`${styles.slider} ${isMobileMoney ? styles.mobileActive : ''}`} />
            </div>
          </div>

          {isMobileMoney ? (
            <div className={styles.mobileMoneyDetails}>
              <label htmlFor="phoneNumber">Mobile Money Number:</label>
              <input
                id="phoneNumber"
                type="tel"
                className={styles.phoneInput}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter your mobile money number"
              />
            </div>
          ) : (
            <div className={styles.bankDetails}>
              <label htmlFor="bank">Select Bank:</label>
              <select 
                id="bank"
                className={styles.bankSelect}
                value={selectedBank}
                onChange={handleBankChange}
              >
                <option value="">Select a bank...</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name}
                  </option>
                ))}
              </select>

              <label htmlFor="accountNumber">Account Number:</label>
              <input
                id="accountNumber"
                type="text"
                className={styles.accountInput}
                value={accountNumber}
                onChange={handleAccountNumberChange}
                placeholder="Enter account number"
              />

              <label htmlFor="memo">Memo (Optional):</label>
              <input
                id="memo"
                type="text"
                className={styles.memoInput}
                value={memo}
                onChange={handleMemoChange}
                placeholder="Enter memo or reference"
              />
            </div>
          )}

          <div className={styles.exchange}>
            <div className={styles.inputGroup}>
              <label>Pay</label>
              <input 
                type="text" 
                value={amount}
                onChange={handleAmountChange}
              />
              <div 
                className={`${styles.currencySelect} ${isDropdownOpen ? styles.open : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={styles.currency}>{selectedToken.symbol}</span>
                <span className={styles.networkBadge}>{selectedToken.network}</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    {tokens.map((token) => (
                      <div 
                        key={`${token.symbol}-${token.network}`}
                        className={styles.dropdownItem}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <span className={styles.currency}>{token.symbol}</span>
                        <span className={styles.networkBadge}>{token.network}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Receive</label>
              <input 
                type="text" 
                value={receivedAmount}
                readOnly 
              />
              <div 
                className={`${styles.currencySelect} ${isReceiveDropdownOpen ? styles.open : ''}`}
                onClick={() => setIsReceiveDropdownOpen(!isReceiveDropdownOpen)}
              >
                <span className={styles.currency}>{receiveCurrency.label}</span>
                <span className={styles.flagBadge}>{receiveCurrency.country}</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {isReceiveDropdownOpen && (
                  <div className={styles.dropdown}>
                    {receiveOptions.map((option) => (
                      <div 
                        key={option.label}
                        className={styles.dropdownItem}
                        onClick={() => handleReceiveCurrencySelect(option)}
                      >
                        <span className={styles.currency}>{option.label}</span>
                        <span className={styles.flagBadge}>{option.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.rate}>
            1 {selectedToken.symbol} = {selectedToken.rate} {receiveCurrency.label}
            <span className={styles.updateTime}>Quote updates in 29s</span>
          </div>
          <div className={styles.fee}>
            Estimated Fee <span className={styles.feeAmount}>0.25 {selectedToken.symbol}</span>
          </div>

          <Link 
            href={`/sell/review?amount=${amount}&token=${selectedToken.symbol}&network=${selectedToken.network}&receiveCurrency=${receiveCurrency.label}&receiveAmount=${receivedAmount}&offrampType=${isMobileMoney ? 'mobile' : 'bank'}&${isMobileMoney ? `phone=${phoneNumber}` : `bank=${encodeURIComponent(bankName)}&account=${accountNumber}&memo=${memo}`}`}
            className={styles.nextButton}
          >
            Review
          </Link>
        </div>
      </div>
    </div>
  );
}