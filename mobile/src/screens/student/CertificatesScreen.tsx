import React from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/constants/config';
import { getStoredAuth } from '@/api/client';
import { getCertificates } from '@/api/certificates.api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { formatDate } from '@/utils/formatDate';

interface CertificateItem {
  id: string;
  issuedAt: string;
  verificationCode: string;
  event: {
    title: string;
  };
}

interface CertificatesResponse {
  certificates?: CertificateItem[];
}

export function CertificatesScreen() {
  const certificatesQuery = useQuery<CertificatesResponse>({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });

  const openCertificate = async (certificateId: string, verificationCode: string) => {
    const storedAuth = await getStoredAuth();

    if (!storedAuth?.accessToken) {
      Alert.alert('Sign in required', 'Please sign in again before opening your certificate.');
      return;
    }

    await Linking.openURL(
      `${API_BASE_URL}/api/certificates/${certificateId}/download?code=${verificationCode}&token=${encodeURIComponent(
        storedAuth.accessToken,
      )}`,
    );
  };

  if (certificatesQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading certificates..." />
      </Screen>
    );
  }

  if (certificatesQuery.isError) {
    return (
      <Screen>
        <ErrorState description="Unable to load certificates." onRetry={() => certificatesQuery.refetch()} />
      </Screen>
    );
  }

  const certificates = certificatesQuery.data?.certificates ?? [];

  return (
    <Screen>
      <Header title="Certificates" subtitle="View and download the certificates issued from EventEase." />
      {certificates.length ? (
        certificates.map(certificate => (
          <Card key={certificate.id}>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-neutral-900">{certificate.event.title}</Text>
              <Text className="text-sm text-neutral-500">Issued {formatDate(certificate.issuedAt)}</Text>
              <Text className="text-xs text-neutral-500">Verification code: {certificate.verificationCode}</Text>
              <Button
                title="View Certificate"
                onPress={() => openCertificate(certificate.id, certificate.verificationCode)}
              />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="No certificates yet" description="Attend events and wait for organizers to issue certificates." />
      )}
    </Screen>
  );
}
