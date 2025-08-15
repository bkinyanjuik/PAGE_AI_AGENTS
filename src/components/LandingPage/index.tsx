import React, { useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particlesRef.current) {
      const particles = Array.from({ length: 50 }, (_, i) => {
        const particle = document.createElement('div');
        particle.className = styles.particle;
        particle.style.setProperty('--delay', `${Math.random() * 5}s`);
        particle.style.setProperty('--size', `${Math.random() * 2 + 1}px`);
        return particle;
      });
      
      particles.forEach(p => particlesRef.current?.appendChild(p));
    }
  }, []);

  return (
    <div className={styles.container}>
      <div ref={particlesRef} className={styles.particles}></div>
      
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Next-Gen <span className={styles.highlight}>AI</span> Orchestration
          </h1>
          <p className={styles.subtitle}>
            Empower your workflow with intelligent agents and seamless automation
          </p>
          
          <div className={styles.cta}>
            <button className={styles.primaryButton}>
              Get Started
              <span className={styles.buttonGlow}></span>
            </button>
            <button className={styles.secondaryButton}>
              Learn More
              <span className={styles.buttonGlow}></span>
            </button>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>Intelligent Agents</h3>
            <p>Advanced AI agents collaborating seamlessly</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Smart Workflows</h3>
            <p>Automated task management and optimization</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Real-time Analytics</h3>
            <p>Deep insights into your AI operations</p>
          </div>
        </div>
      </div>

      <div className={styles.glowOrbs}>
        <div className={styles.orb}></div>
        <div className={styles.orb}></div>
        <div className={styles.orb}></div>
      </div>
    </div>
  );
};

export default LandingPage;
