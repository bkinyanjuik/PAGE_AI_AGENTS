import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

const Navigation = () => {
  const [activeItem, setActiveItem] = useState('');
  
  const navItems = [
    { label: 'Advisories', path: '/advisories', icon: '🎯' },
    { label: 'Agents', path: '/agents', icon: '🤖' },
    { label: 'Tasks', path: '/tasks', icon: '✨' },
    { label: 'Workflows', path: '/workflows', icon: '⚡' }
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.glassMorphism}></div>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>
            Vibe<span className={styles.logoHighlight}>coded</span>
          </span>
        </Link>
      </div>
      <div className={styles.navItems}>
        {Array.isArray(navItems) && navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${activeItem === item.path ? styles.active : ''}`}
            onClick={() => setActiveItem(item.path)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            <div className={styles.navGlow}></div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
