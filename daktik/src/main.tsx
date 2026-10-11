import React, { StrictMode, ReactNode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * UI selection.
 * - `next`   — the new Daktik design (src/next). Enable with `?ui=next`
 *              (remembered on this device) or build with VITE_DAKTIK_UI=next.
 * - `legacy` — the previous interface. `?ui=legacy` switches back.
 * Each UI is loaded lazily so neither ships the other's code or styles.
 */
const pickUi = (): 'next' | 'legacy' => {
  const param = new URLSearchParams(window.location.search).get('ui');
  try {
    if (param === 'next' || param === 'legacy') localStorage.setItem('daktik.ui', param);
    const saved = localStorage.getItem('daktik.ui');
    if (saved === 'next' || saved === 'legacy') return saved;
  } catch {
    if (param === 'next' || param === 'legacy') return param;
  }
  return import.meta.env.VITE_DAKTIK_UI === 'next' ? 'next' : 'legacy';
};

const ui = pickUi();
const App = ui === 'next'
  ? lazy(() => import('./next/App.tsx'))
  : lazy(() => import('./index.css').then(() => import('./App.tsx')));

class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h2>শান্ত হোন, ডাকঘরে একটি বিভ্রাট ঘটেছে!</h2>
          <p>অ্যাপটি লোড হতে সমস্যা হচ্ছে। দয়া করে নিচের এররটি চেক করুন:</p>
          <pre style={{ background: '#eee', padding: '10px', borderRadius: '5px', maxWidth: '90%', overflow: 'auto' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#b71c1c', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            পুনরায় চেষ্টা করুন (Reload)
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
