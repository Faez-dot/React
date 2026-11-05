import { ApplicationVerifier, RecaptchaVerifier } from 'firebase/auth';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { auth } from './firebaseConfig';

// Web: Firebase's own invisible reCAPTCHA runs directly in the page (no WebView needed).
const CONTAINER_ID = 'recaptcha-container';

export function useRecaptchaVerifier() {
  const rv = useRef<RecaptchaVerifier | null>(null);

  const destroy = () => {
    try {
      rv.current?.clear();
    } catch {}
    rv.current = null;
  };

  useEffect(() => destroy, []);

  const verifier = useMemo(() => {
    const v = {
      type: 'recaptcha',
      verify: async () => {
        if (!rv.current) {
          rv.current = new RecaptchaVerifier(auth, CONTAINER_ID, { size: 'invisible' });
        }
        return rv.current.verify();
      },
      // Called by the SDK after a failed attempt so the next try gets a fresh widget.
      _reset: destroy,
    };
    return v as ApplicationVerifier;
  }, []);

  const modal = <View nativeID={CONTAINER_ID} />;
  return { verifier, modal };
}
