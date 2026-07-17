'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log every root-level crash to the browser console
    console.error('[GLOBAL ERROR - Root Level]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
            background: '#fafafa',
          }}
        >
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h1 style={{ color: '#dc2626', fontWeight: 700, fontSize: '22px', margin: 0 }}>
              Application Error
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              {error.message || 'A critical error occurred. Please refresh the page.'}
            </p>
            {error.digest && (
              <p style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace', marginTop: '4px' }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
