import type { ApplicationVerifier } from 'firebase/auth';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { firebaseConfig } from './firebaseConfig';

// Firebase's JS SDK needs a reCAPTCHA token to send an SMS. React Native has no DOM,
// so the reCAPTCHA is rendered in a WebView hosted on the project's authorized domain
// and the token is handed back to the JS SDK through an ApplicationVerifier.
const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif}</style>
</head><body><div id="rc"></div>
<script>
  function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o));}
  try {
    firebase.initializeApp(${JSON.stringify(firebaseConfig)});
    var v = new firebase.auth.RecaptchaVerifier('rc', {
      size: 'normal',
      callback: function(t){ send({token:t}); },
      'expired-callback': function(){ send({error:'reCAPTCHA expired. Please try again.'}); }
    });
    v.render().catch(function(e){ send({error:String(e && e.message || e)}); });
  } catch (e) { send({error:String(e && e.message || e)}); }
</script></body></html>`;

export function useRecaptchaVerifier() {
  const [visible, setVisible] = useState(false);
  const pending = useRef<{
    resolve: (t: string) => void;
    reject: (e: Error) => void;
  } | null>(null);

  const finish = useCallback((token?: string, error?: string) => {
    const p = pending.current;
    pending.current = null;
    setVisible(false);
    if (!p) return;
    if (token) p.resolve(token);
    else p.reject(new Error(error ?? 'reCAPTCHA cancelled'));
  }, []);

  const verifier = useMemo<ApplicationVerifier>(
    () =>
      ({
        type: 'recaptcha',
        verify: () =>
          new Promise<string>((resolve, reject) => {
            pending.current = { resolve, reject };
            setVisible(true);
          }),
        _reset: () => {},
      }) as ApplicationVerifier,
    [],
  );

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      finish(data.token, data.error);
    } catch {
      finish(undefined, 'Invalid reCAPTCHA response');
    }
  };

  const modal = (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => finish()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify you're human</Text>
          <View style={styles.web}>
            <WebView
              originWhitelist={['*']}
              source={{ html, baseUrl: `https://${firebaseConfig.authDomain}` }}
              onMessage={onMessage}
              javaScriptEnabled
              startInLoadingState
              renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} />}
              onError={() => finish(undefined, 'Could not load reCAPTCHA. Check your internet.')}
            />
          </View>
          <Pressable onPress={() => finish()} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return { verifier, modal };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#202C28', marginBottom: 8 },
  web: { height: 140 },
  cancel: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 4 },
  cancelText: { color: '#3E765B', fontWeight: '700' },
});
