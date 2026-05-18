import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/hooks/useAuth';
import { updateCurrentUser } from '@/api/auth.api';
import { getErrorMessage } from '@/utils/errors';

export function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [interestsText, setInterestsText] = useState(user?.interests.join(', ') ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateCurrentUser({
        name,
        department,
        year,
        phone,
        interests: interestsText
          .split(',')
          .map(value => value.trim())
          .filter(Boolean),
      });
      setUser(response.user);
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error, 'Unable to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Complete your profile" subtitle="Finish onboarding so EventEase can personalize your experience." />
      <Card>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Full Name</Text>
            <Input value={name} onChangeText={setName} />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Department</Text>
            <Input value={department} onChangeText={setDepartment} />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Year</Text>
            <Input value={year} onChangeText={setYear} />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Phone</Text>
            <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Interests</Text>
            <Input value={interestsText} onChangeText={setInterestsText} placeholder="AI, Web Dev, Robotics" />
          </View>
          <Button title="Finish & Continue" onPress={handleSave} loading={saving} />
        </View>
      </Card>
    </Screen>
  );
}
