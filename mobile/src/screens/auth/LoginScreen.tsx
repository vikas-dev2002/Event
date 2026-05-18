import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { z } from 'zod';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';

type AuthNavigation = {
  navigate: (screen: string) => void;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginScreen({ navigation }: { navigation: AuthNavigation }) {
  const { login, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid email and password.');
      return;
    }

    try {
      await login(parsed.data);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to sign in.'));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) {
        setError('Google sign-in did not return an ID token.');
        return;
      }
      await loginWithGoogle(idToken);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to continue with Google.'));
    }
  };

  return (
    <Screen>
      <Header title="Welcome back" subtitle="Sign in to your EventEase account." />
      <Card>
        <View className="gap-4">
          {error ? (
            <View className="rounded-2xl bg-red-50 px-4 py-3">
              <AppText variant="bodySmall" tone="destructive">{error}</AppText>
            </View>
          ) : null}

          <View className="gap-2">
            <AppText variant="bodySmall" tone="subtle">Email</AppText>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@college.edu"
            />
          </View>

          <View className="gap-2">
            <AppText variant="bodySmall" tone="subtle">Password</AppText>
            <Input secureTextEntry value={password} onChangeText={setPassword} placeholder="Enter your password" />
          </View>

          <Button title="Sign In" onPress={handleSubmit} loading={loading} />
          <Button title="Continue with Google" variant="outline" onPress={handleGoogleSignIn} />

          <View className="items-center">
            <AppText variant="caption" tone="muted">Use Google only after setting your mobile OAuth client IDs.</AppText>
          </View>

          <Pressable onPress={() => navigation.navigate('Register')}>
            <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
              Don&apos;t have an account? <AppText variant="bodySmall" style={{ fontWeight: '600' }}>Create one</AppText>
            </AppText>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
