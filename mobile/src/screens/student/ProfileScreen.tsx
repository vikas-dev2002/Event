import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { updateCurrentUser } from '@/api/auth.api';
import { getCertificates } from '@/api/certificates.api';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useRegistrations } from '@/hooks/useRegistrations';
import { getErrorMessage } from '@/utils/errors';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Other',
] as const;

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni'] as const;

export function ProfileScreen() {
  const { user, logout, setUser } = useAuth();
  const registrationsQuery = useRegistrations();
  const certificatesQuery = useQuery({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [newInterest, setNewInterest] = useState('');

  const registrations = registrationsQuery.data?.registrations ?? [];
  const certificates = certificatesQuery.data?.certificates ?? [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateCurrentUser({
        name,
        department,
        year,
        phone,
        interests,
      });
      setUser(result.user);
      Alert.alert('Saved', result.message);
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed || interests.includes(trimmed)) {
      return;
    }
    setInterests(current => [...current, trimmed]);
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setInterests(current => current.filter(item => item !== interest));
  };

  return (
    <Screen>
      <Header title="Profile" subtitle={user?.email ?? 'Your EventEase profile'} />

      <Card>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-neutral-900">{user?.name ?? 'EventEase User'}</Text>
            <View className="flex-row flex-wrap gap-2">
              {user?.role ? <Badge label={user.role} tone="default" /> : null}
              {user?.org?.name ? <Badge label={user.org.name} tone="secondary" /> : null}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4">
            {[
              { label: 'Registrations', value: registrations.length },
              { label: 'Certificates', value: certificates.length },
              {
                label: 'Interests',
                value: user?.interests.length ?? 0,
              },
            ].map(item => (
              <View key={item.label} className="w-[30%]">
                <Card>
                  <Text className="text-sm text-neutral-500">{item.label}</Text>
                  <Text className="mt-2 text-2xl font-bold text-neutral-900">{item.value}</Text>
                </Card>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Name</Text>
            <Input value={name} onChangeText={setName} />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Department</Text>
            <View className="flex-row flex-wrap gap-2">
              {departments.map(option => (
                <Pressable key={option} onPress={() => setDepartment(option)}>
                  <View className={`rounded-full border px-3 py-2 ${department === option ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}>
                    <Text className={`text-xs font-medium ${department === option ? 'text-white' : 'text-neutral-700'}`}>{option}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Year</Text>
            <View className="flex-row flex-wrap gap-2">
              {years.map(option => (
                <Pressable key={option} onPress={() => setYear(option)}>
                  <View className={`rounded-full border px-3 py-2 ${year === option ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}>
                    <Text className={`text-xs font-medium ${year === option ? 'text-white' : 'text-neutral-700'}`}>{option}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Phone</Text>
            <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700">Interests</Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input value={newInterest} onChangeText={setNewInterest} placeholder="Add an interest" />
              </View>
              <View style={{ width: 120 }}>
                <Button title="Add" variant="outline" onPress={addInterest} />
              </View>
            </View>
          </View>
          {interests.length ? (
            <View className="flex-row flex-wrap gap-2">
              {interests.map(interest => (
                <Pressable key={interest} onPress={() => removeInterest(interest)}>
                  <View className="rounded-full bg-neutral-100 px-3 py-2">
                    <Text className="text-xs font-semibold text-neutral-700">{interest} ×</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Button title="Save Changes" onPress={handleSave} loading={saving} />
          <Button title="Log Out" variant="outline" onPress={() => logout()} />
        </View>
      </Card>
    </Screen>
  );
}
