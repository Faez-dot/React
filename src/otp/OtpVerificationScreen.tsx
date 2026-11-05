import { ConfirmationResult, signInWithPhoneNumber } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { useRecaptchaVerifier } from './useRecaptchaVerifier';

const RESEND_SECONDS = 60;

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-phone-number': 'Invalid phone number. Use international format, e.g. +923001234567.',
    'auth/missing-phone-number': 'Please enter a phone number.',
    'auth/too-many-requests': 'Too many attempts. Please wait a while and try again.',
    'auth/quota-exceeded': 'SMS quota exceeded. Try a Firebase test number or try later.',
    'auth/invalid-verification-code': 'Incorrect OTP. Please check the code and try again.',
    'auth/code-expired': 'This OTP has expired. Please request a new one.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/captcha-check-failed': 'reCAPTCHA failed. Make sure authDomain is correct and authorized.',
    'auth/operation-not-allowed':
      'Phone sign-in is not enabled (or this region is blocked) in Firebase Console.',
    'auth/billing-not-enabled':
      'Real SMS needs the Firebase Blaze (billing) plan. Upgrade it, or use a Firebase test phone number.',
    'auth/app-not-authorized': 'App not authorized. Check apiKey / authDomain in firebaseConfig.',
  };
  return map[code] ?? (e as Error)?.message ?? 'Something went wrong. Please try again.';
}

export default function OtpVerificationScreen({ onVerified }: { onVerified: () => void }) {
  const { verifier, modal } = useRecaptchaVerifier();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const normalized = phone.replace(/[\s\-()]/g, '');
  const phoneValid = /^\+[1-9]\d{7,14}$/.test(normalized);

  const sendOtp = async () => {
    if (loading) return;
    if (!phoneValid) {
      setMessage({ ok: false, text: 'Enter a valid number with country code, e.g. +923001234567.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await signInWithPhoneNumber(auth, normalized, verifier);
      setConfirmation(result);
      setCode('');
      setCooldown(RESEND_SECONDS);
      setMessage({ ok: true, text: `OTP sent to ${normalized}.` });
    } catch (e) {
      setMessage({ ok: false, text: friendlyError(e) });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (loading || !confirmation) return;
    if (!/^\d{6}$/.test(code)) {
      setMessage({ ok: false, text: 'Enter the 6-digit OTP.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const cred = await confirmation.confirm(code);
      setVerifiedPhone(cred.user.phoneNumber ?? normalized);
      setMessage({ ok: true, text: 'Verification successful! Your phone number is verified.' });
    } catch (e) {
      setMessage({ ok: false, text: `Verification failed. ${friendlyError(e)}` });
    } finally {
      setLoading(false);
    }
  };

  const changeNumber = () => {
    setConfirmation(null);
    setCode('');
    setMessage(null);
  };

  if (verifiedPhone) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.title}>Phone verified</Text>
        <Text style={styles.sub}>{verifiedPhone}</Text>
        <Pressable style={[styles.button, { alignSelf: 'stretch', marginTop: 24 }]} onPress={onVerified}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Verify your phone</Text>
        <Text style={styles.sub}>
          {confirmation
            ? 'Enter the 6-digit code we sent by SMS.'
            : 'We will send a one-time password (OTP) by SMS.'}
        </Text>

        {!isFirebaseConfigured && (
          <Text style={[styles.msg, styles.err]}>
            Firebase is not configured. Fill in src/otp/firebaseConfig.ts.
          </Text>
        )}

        {!confirmation ? (
          <>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+923001234567"
              placeholderTextColor="#9AA39E"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              editable={!loading}
            />
            <Pressable
              style={[styles.button, (loading || !isFirebaseConfigured) && styles.disabled]}
              onPress={sendOtp}
              disabled={loading || !isFirebaseConfigured}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>OTP code</Text>
            <TextInput
              style={[styles.input, styles.otp]}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="······"
              placeholderTextColor="#9AA39E"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              editable={!loading}
            />
            <Pressable
              style={[styles.button, (loading || code.length !== 6) && styles.disabled]}
              onPress={verifyOtp}
              disabled={loading || code.length !== 6}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </Pressable>
            <View style={styles.row}>
              <Pressable onPress={changeNumber} disabled={loading}>
                <Text style={styles.link}>Change number</Text>
              </Pressable>
              <Pressable onPress={sendOtp} disabled={loading || cooldown > 0}>
                <Text style={[styles.link, cooldown > 0 && { color: '#9AA39E' }]}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {message && (
          <Text style={[styles.msg, message.ok ? styles.ok : styles.err]}>{message.text}</Text>
        )}
      </ScrollView>
      {modal}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F8F4' },
  center: { justifyContent: 'center', padding: 24, alignItems: 'center' },
  content: { padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '800', color: '#202C28' },
  sub: { fontSize: 15, color: '#77817B', marginTop: 6, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#202C28', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8EBE5',
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    color: '#202C28',
    marginBottom: 16,
  },
  otp: { letterSpacing: 8, textAlign: 'center', fontSize: 24 },
  button: { backgroundColor: '#3E765B', borderRadius: 12, padding: 15, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  link: { color: '#3E765B', fontWeight: '700', fontSize: 14 },
  msg: { marginTop: 18, padding: 12, borderRadius: 10, fontSize: 14, overflow: 'hidden' },
  ok: { backgroundColor: '#E9F1E8', color: '#2C5A43' },
  err: { backgroundColor: '#FBE9EA', color: '#9B2C36' },
  check: { fontSize: 64, color: '#3E765B', fontWeight: '800' },
});
