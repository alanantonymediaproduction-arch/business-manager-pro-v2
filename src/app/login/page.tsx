'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Diamond, User, Lock, Eye, EyeOff, ArrowRight, Key, Shield } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <Diamond size={24} />
        </div>
        
        <h1 className={styles.title}>Business Manager Pro</h1>
        <p className={styles.subtitle}>Executive Precision & Control</p>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Email or Phone Number</label>
            </div>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="admin@sterling.com" 
                defaultValue="admin@sterling.com"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Password or OTP</label>
              <span className={styles.forgotLink}>Forgot?</span>
            </div>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className={styles.input} 
                placeholder="••••••••" 
                defaultValue="password123"
                required
              />
              {showPassword ? (
                <EyeOff className={styles.eyeIcon} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className={styles.eyeIcon} onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>

          <div className={styles.rememberRow}>
            <input type="checkbox" className={styles.checkbox} id="remember" />
            <label htmlFor="remember" className={styles.rememberText}>Remember device</label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className={styles.divider}>Enterprise SSO</div>

        <div className={styles.ssoGrid}>
          <button type="button" className={styles.ssoBtn}>
            <Key size={14} /> Okta
          </button>
          <button type="button" className={styles.ssoBtn}>
            <Shield size={14} /> SAML
          </button>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerLink}>Privacy Policy</span>
          <span>·</span>
          <span className={styles.footerLink}>Support</span>
        </div>
      </div>
    </div>
  );
}
