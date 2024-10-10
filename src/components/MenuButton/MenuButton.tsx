"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styles from './MenuButton.module.css';

const MenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <button className={styles.menuButton} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faEllipsisV} className={styles.icon} />
      </button>
      <div ref={popupRef} className={`${styles.popup} ${isOpen ? styles.show : ''}`}>
        <div className={styles.popupItem}>Help Center</div>
        <div className={styles.popupItem}>Terms of Use</div>
        <div className={styles.popupItem}>Privacy Policy</div>
      </div>
    </div>
  );
};

export default MenuButton;