import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { registerForEvent } from '@/api/events.api';
import { getErrorMessage } from '@/utils/errors';

interface EventRegisterButtonProps {
  eventId: string;
  isFull: boolean;
  waitlistEnabled: boolean;
  onSuccess?: () => void;
}

export function EventRegisterButton({
  eventId,
  isFull,
  waitlistEnabled,
  onSuccess,
}: EventRegisterButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await registerForEvent(eventId, isFull);
      Alert.alert('Success', result.message ?? (isFull ? 'Added to waitlist' : 'Registration confirmed'));
      onSuccess?.();
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to register for the event');
      if (isFull && waitlistEnabled) {
        Alert.alert('Event Full', 'This event is full. You can join the waitlist.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join Waitlist',
            onPress: async () => {
              try {
                setLoading(true);
                const result = await registerForEvent(eventId, true);
                Alert.alert('Joined Waitlist', result.message ?? 'You have been added to the waitlist.');
                onSuccess?.();
              } catch (waitlistError) {
                Alert.alert('Error', getErrorMessage(waitlistError));
              } finally {
                setLoading(false);
              }
            },
          },
        ]);
      } else {
        Alert.alert('Registration Failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={isFull ? (waitlistEnabled ? 'Join Waitlist' : 'Event Full') : 'Register Now'}
      onPress={handleRegister}
      disabled={isFull && !waitlistEnabled}
      loading={loading}
    />
  );
}
