import React, { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Shield, CheckCircle2, XCircle, Award, CalendarDays, Building2, User } from 'lucide-react-native';
import { verifyCertificate } from '@/api/certificates.api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatDate';

type VerifyResult =
  | {
      valid: true;
      certificate: NonNullable<Awaited<ReturnType<typeof verifyCertificate>>['certificate']>;
    }
  | {
      valid: false;
      code?: string;
      message?: string;
    };

export function VerifyCertificateScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert('Missing code', 'Please enter a certificate verification code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyCertificate(trimmed);
      if (data.valid && data.certificate) {
        setResult({ valid: true, certificate: data.certificate });
      } else {
        setResult({
          valid: false,
          code: data.code ?? trimmed,
          message: data.message ?? 'The verification code does not match any issued certificate.',
        });
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to verify this certificate right now.');
      setResult({
        valid: false,
        code: trimmed,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header
        title="Verify Certificate"
        subtitle="Check certificate authenticity directly inside the EventEase app."
      />

      <Card>
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Shield size={30} color="#171717" />
          </View>
          <View className="gap-2">
            <AppText variant="screenTitle" style={{ textAlign: 'center' }}>
              Verify Certificate
            </AppText>
            <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
              Enter the verification code printed on any EventEase certificate to confirm authenticity.
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <View className="gap-3">
          <AppText variant="bodySmall" tone="subtle">Verification Code</AppText>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            value={code}
            onChangeText={setCode}
            placeholder="e.g. a1b2c3d4-e5f6-7890-abcd"
          />
          <Button title="Verify Certificate" onPress={handleVerify} loading={loading} />
          <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
            The verification code is usually printed near the bottom of the certificate.
          </AppText>
        </View>
      </Card>

      {loading ? (
        <Card>
          <View className="items-center gap-3 py-3">
            <ActivityIndicator />
            <AppText variant="bodySmall" tone="muted">Checking certificate authenticity...</AppText>
          </View>
        </Card>
      ) : null}

      {result?.valid ? (
        <Card>
          <View className="gap-5">
            <View className="items-center gap-3 border-b border-neutral-200 pb-5">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 size={34} color="#16a34a" />
              </View>
              <View className="gap-1">
                <AppText variant="sectionTitle" style={{ textAlign: 'center' }}>
                  Certificate Verified
                </AppText>
                <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
                  This certificate is authentic and was issued by EventEase.
                </AppText>
              </View>
            </View>

            <View className="gap-4">
              <View className="flex-row gap-3">
                <User size={20} color="#737373" />
                <View className="flex-1 gap-1">
                  <AppText variant="caption" tone="muted">Issued to</AppText>
                  <AppText variant="cardTitle">{result.certificate.user.name}</AppText>
                  {result.certificate.user.department ? (
                    <AppText variant="bodySmall" tone="muted">
                      {result.certificate.user.department}
                    </AppText>
                  ) : null}
                </View>
              </View>

              <View className="flex-row gap-3">
                <Award size={20} color="#737373" />
                <View className="flex-1 gap-1">
                  <AppText variant="caption" tone="muted">Event</AppText>
                  <AppText variant="cardTitle">{result.certificate.event.title}</AppText>
                  <AppText variant="bodySmall" tone="muted">
                    {result.certificate.event.category}
                  </AppText>
                </View>
              </View>

              {result.certificate.event.org?.name ? (
                <View className="flex-row gap-3">
                  <Building2 size={20} color="#737373" />
                  <View className="flex-1 gap-1">
                    <AppText variant="caption" tone="muted">Organization</AppText>
                    <AppText variant="cardTitle">{result.certificate.event.org.name}</AppText>
                  </View>
                </View>
              ) : null}

              <View className="flex-row gap-3">
                <CalendarDays size={20} color="#737373" />
                <View className="flex-1 gap-1">
                  <AppText variant="caption" tone="muted">Event Date</AppText>
                  <AppText variant="cardTitle">{formatDate(result.certificate.event.startDate)}</AppText>
                </View>
              </View>
            </View>

            <View className="gap-2 border-t border-neutral-200 pt-4">
              <View className="flex-row items-center justify-between gap-4">
                <AppText variant="bodySmall" tone="muted">Issued on</AppText>
                <AppText variant="bodySmall">{formatDate(result.certificate.issuedAt)}</AppText>
              </View>
              <View className="flex-row items-center justify-between gap-4">
                <AppText variant="bodySmall" tone="muted">Verification Code</AppText>
                <AppText variant="caption">{result.certificate.verificationCode}</AppText>
              </View>
            </View>
          </View>
        </Card>
      ) : null}

      {result && !result.valid ? (
        <Card>
          <View className="items-center gap-4 py-3">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle size={34} color="#dc2626" />
            </View>
            <View className="gap-1">
              <AppText variant="sectionTitle" tone="destructive" style={{ textAlign: 'center' }}>
                Certificate Not Found
              </AppText>
              <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
                {result.message ?? 'The verification code does not match any issued certificate.'}
              </AppText>
            </View>
            {result.code ? (
              <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
                Code checked: {result.code}
              </AppText>
            ) : null}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
