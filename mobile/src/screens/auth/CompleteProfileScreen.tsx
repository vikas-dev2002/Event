import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { updateCurrentUser } from '@/api/auth.api';
import { getMappedColleges } from '@/api/profile.api';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';

export function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [interestsText, setInterestsText] = useState(user?.interests.join(', ') ?? '');
  const [collegeQuery, setCollegeQuery] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');

  const collegesQuery = useQuery({
    queryKey: ['mobile-colleges'],
    queryFn: getMappedColleges,
    enabled: !user?.orgId,
  });

  const filteredColleges = (collegesQuery.data ?? [])
    .filter(college => {
      const query = collegeQuery.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return (
        college.name.toLowerCase().includes(query) ||
        college.city.toLowerCase().includes(query) ||
        college.type.toLowerCase().includes(query)
      );
    })
    .slice(0, 25);

  const selectedCollege =
    collegesQuery.data?.find(college => college.slug === organizationSlug) ?? null;

  const handleSave = async () => {
    if (!user?.orgId && !organizationSlug) {
      Alert.alert('Select your college', 'Please choose your college before continuing.');
      return;
    }

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
        organizationSlug: user?.orgId ? undefined : organizationSlug,
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
      <Header
        title="Complete your profile"
        subtitle="Finish onboarding so EventEase can personalize your experience."
      />

      {!user?.orgId ? (
        <Card>
          <View className="gap-4">
            <View className="gap-2">
              <AppText variant="cardTitle">Select your college</AppText>
              <AppText variant="bodySmall" tone="muted">
                We couldn&apos;t automatically map your account to a college. Choose it once to
                unlock the full EventEase experience.
              </AppText>
            </View>

            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Search size={16} color="#737373" />
              </View>
              <Input
                value={collegeQuery}
                onChangeText={setCollegeQuery}
                placeholder="Search by college, city, or type"
                style={{ paddingLeft: 40 }}
              />
            </View>

            {selectedCollege ? (
              <View className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <AppText variant="label">{selectedCollege.name}</AppText>
                    <AppText variant="caption" tone="muted">
                      {selectedCollege.city} - {selectedCollege.type}
                    </AppText>
                  </View>
                  <Pressable onPress={() => setOrganizationSlug('')}>
                    <AppText variant="caption" tone="primary">
                      Clear
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : collegesQuery.isLoading ? (
              <AppText variant="bodySmall" tone="muted">
                Loading colleges...
              </AppText>
            ) : (
              <View className="gap-2">
                {filteredColleges.length ? (
                  filteredColleges.map(college => (
                    <Pressable
                      key={college.slug}
                      onPress={() => setOrganizationSlug(college.slug)}>
                      <View className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                        <AppText variant="label">{college.name}</AppText>
                        <AppText variant="caption" tone="muted">
                          {college.city} - {college.type}
                        </AppText>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <AppText variant="bodySmall" tone="muted">
                    No colleges match your search right now.
                  </AppText>
                )}
              </View>
            )}
          </View>
        </Card>
      ) : (
        <Card>
          <View className="gap-3">
            <AppText variant="cardTitle">Your college</AppText>
            <OrgIdentity
              name={user.org?.name ?? 'Organization connected'}
              logoUrl={user.org?.logo}
              subtitle="Your profile is linked to this organization."
              size="sm"
            />
          </View>
        </Card>
      )}

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
            <Input
              value={interestsText}
              onChangeText={setInterestsText}
              placeholder="AI, Web Dev, Robotics"
            />
          </View>
          <Button title="Finish & Continue" onPress={handleSave} loading={saving} />
        </View>
      </Card>
    </Screen>
  );
}
