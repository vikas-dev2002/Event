import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';

type RegisterNavigation = {
  navigate: (screen: string) => void;
  goBack: () => void;
};

export function RegisterScreen({ navigation }: { navigation: RegisterNavigation }) {
  const { register, loginWithGoogle, loading } = useAuth();
  const [role, setRole] = useState<'STUDENT' | 'ORGANIZER'>('STUDENT');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '',
    collegeName: '',
    designation: '',
    organizationWeb: '',
    reason: '',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const result = await register({
        ...form,
        role,
      });

      if (result.requiresVerification) {
        navigation.navigate('VerificationPending');
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to create account.'));
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
      <Header title="Create account" subtitle="Join EventEase with the same flow as the web app." />
      <Card>
        <View className="gap-4">
          {error ? (
            <View className="rounded-2xl bg-red-50 px-4 py-3">
              <AppText variant="bodySmall" tone="destructive">{error}</AppText>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            <Pressable className="flex-1" onPress={() => setRole('STUDENT')}>
              <View className={`rounded-2xl border p-3 ${role === 'STUDENT' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                <AppText variant="label" style={{ textAlign: 'center' }}>Student</AppText>
              </View>
            </Pressable>
            <Pressable className="flex-1" onPress={() => setRole('ORGANIZER')}>
              <View className={`rounded-2xl border p-3 ${role === 'ORGANIZER' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                <AppText variant="label" style={{ textAlign: 'center' }}>Organizer</AppText>
              </View>
            </Pressable>
          </View>

          {role === 'ORGANIZER' ? <Badge label="Organizer accounts require admin verification" tone="warning" /> : null}

          {[
            ['name', 'Full name'],
            ['email', 'Email'],
            ['department', 'Department'],
            ['year', 'Year'],
            ['password', 'Password'],
            ['confirmPassword', 'Confirm password'],
          ].map(([key, label]) => (
            <View key={key} className="gap-2">
              <AppText variant="bodySmall" tone="subtle">{label}</AppText>
              <Input
                autoCapitalize={key === 'email' ? 'none' : 'words'}
                keyboardType={key === 'email' ? 'email-address' : 'default'}
                secureTextEntry={key.toLowerCase().includes('password')}
                value={form[key as keyof typeof form]}
                onChangeText={value => updateField(key as keyof typeof form, value)}
                placeholder={label}
              />
            </View>
          ))}

          {role === 'ORGANIZER' ? (
            <>
              <View className="gap-2">
                <AppText variant="bodySmall" tone="subtle">College / Organization Name</AppText>
                <Input value={form.collegeName} onChangeText={value => updateField('collegeName', value)} />
              </View>
              <View className="gap-2">
                <AppText variant="bodySmall" tone="subtle">Designation / Role</AppText>
                <Input value={form.designation} onChangeText={value => updateField('designation', value)} />
              </View>
              <View className="gap-2">
                <AppText variant="bodySmall" tone="subtle">Organization Website</AppText>
                <Input
                  autoCapitalize="none"
                  value={form.organizationWeb}
                  onChangeText={value => updateField('organizationWeb', value)}
                  placeholder="https://example.edu"
                />
              </View>
              <View className="gap-2">
                <AppText variant="bodySmall" tone="subtle">Why do you want to be an organizer?</AppText>
                <TextInput
                  multiline
                  textAlignVertical="top"
                  value={form.reason}
                  onChangeText={value => updateField('reason', value)}
                  placeholder="Describe your plans..."
                  placeholderTextColor="#737373"
                  className="min-h-28 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900"
                />
              </View>
            </>
          ) : null}

          <Button title="Create Account" onPress={handleSubmit} loading={loading} />
          {role === 'STUDENT' ? <Button title="Continue with Google" variant="outline" onPress={handleGoogleSignIn} /> : null}

          <View className="items-center">
            <AppText variant="caption" tone="muted">Google sign-in remains available on the web panel.</AppText>
          </View>

          <Pressable onPress={() => navigation.goBack()}>
            <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
              Already have an account? <AppText variant="bodySmall" style={{ fontWeight: '600' }}>Sign in</AppText>
            </AppText>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
