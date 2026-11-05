import { ApplicationVerifier, RecaptchaVerifier } from 'firebase/auth';
import { useEffect, useMemo, useRef } from 'react';
import { auth } from './firebaseConfig';

// Web: Firebase's own invisible reCAPTCHA runs directly in the page (no WebView needed).
// Every attempt gets a brand-new container element + verifier, because a reCAPTCHA widget
// cannot be rendered twice into the same element (hot reload / retries caused that error).
export function useRecaptchaVerifier() {
  const rv = useRef<RecaptchaVerifier | null>(null);
  const el = useRef<HTMLDivElement | null>(null);

  const destroy = () => {
    try {
      rv.current?.clear();
    } catch {}
    rv.current = null;
    el.current?.remove();
    el.current = null;
  };

  useEffect(() => destroy, []);

  const verifier = useMemo(() => {
    const v = {
      type: 'recaptcha',
      verify: async () => {
        destroy();
        const div = document.createElement('div');
        document.body.appendChild(div);
        el.current = div;
        rv.current = new RecaptchaVerifier(auth, div, { size: 'invisible' });
        return rv.current.verify();
      },
      _reset: destroy,
    };
    return v as ApplicationVerifier;
  }, []);

  return { verifier, modal: null };
}
