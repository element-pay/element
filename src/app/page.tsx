"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function Home() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
        },
        interactivity: {
          detect_on: 'canvas',
          events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
        },
        retina_detect: true,
      });
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroBackground}></div>
      <div id="particles-js" ref={particlesRef} className={styles.particlesBackground}></div>
      <header className={styles.header}>
        <div className={styles.logo}>Element<span>Pay</span></div>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <a href="#features" onClick={toggleMenu}>Features</a>
          <a href="#developers" onClick={toggleMenu}>Developers</a>
          <a href="#docs" onClick={toggleMenu}>Docs</a>

          <button className={styles.downloadBtn}>
            <a href="/buy/amount">
            Buy
            </a>
          </button>
          <button className={styles.downloadBtn}>
            <a href="/sell/amount">
            Sell
            </a>
          </button>
        </nav>
        <button className={styles.menuToggle} onClick={toggleMenu}>
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
      </header>
      <main className={styles.main}>
        <h1 className={styles.title}>Crypto to Fiat Micropayments</h1>
        <h1 className={styles.title}>In Africa</h1>
        <h2 className={styles.subtitle}>Offramp & Onramp Easily</h2>
        <p className={styles.slogan}> ~Your gateway to effortless payments~ </p>
        <p className={styles.description}>
        Pay with crypto for everyday transactions across Africa. Convert your crypto assets to local currency quickly and securely. Just connect your wallet, and make instant payments anywhere in Africa with ease.
        </p>
        <div className={styles.cta}>
          <a href="/buy/amount">
          <button className={styles.primaryBtn}>Get Started</button>
          </a>
        </div>
      </main>
    </div>
  );
}