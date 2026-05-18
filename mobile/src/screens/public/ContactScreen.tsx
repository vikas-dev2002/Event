import React, { useState } from 'react';
import { Alert, Linking, Pressable, TextInput, View } from 'react-native';
import { ArrowLeft, Clock3, Mail, MapPin, MessageSquare } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';

type ContactNavigation = {
  goBack: () => void;
};

const faqItems = [
  {
    question: 'How do I register for an event?',
    answer:
      'Create a student account, open any event page, and tap the register button to receive your QR code.',
  },
  {
    question: 'How do I create events as an organizer?',
    answer:
      'Sign up as an organizer, complete your profile, then manage your events from the organizer dashboard.',
  },
  {
    question: 'How does QR attendance work?',
    answer:
      'Each registration gets a unique QR code which organizers scan or students use for self check-in.',
  },
  {
    question: 'How can I verify a certificate?',
    answer:
      'Open Verify Certificate from the landing menu, enter the code, and the app will confirm authenticity.',
  },
  {
    question: 'Can I cancel my registration?',
    answer:
      'Yes, upcoming registrations can be managed from My Registrations when that event supports cancellation.',
  },
  {
    question: 'Is EventEase free to use?',
    answer:
      'Yes, the student and organizer experience is free. Institutions can reach out for custom deployments.',
  },
];

export function ContactScreen({ navigation }: { navigation: ContactNavigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please fill in all fields before sending your message.');
      return;
    }

    const mailtoUrl = `mailto:2200521520026@ietlucknow.ac.in?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    )}`;

    const supported = await Linking.canOpenURL(mailtoUrl);
    if (!supported) {
      Alert.alert(
        'Mail app unavailable',
        'No email app was found on this device. Please contact 2200521520026@ietlucknow.ac.in directly.',
      );
      return;
    }

    await Linking.openURL(mailtoUrl);
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <ArrowLeft size={20} color="#171717" />
        </Pressable>
        <AppText variant="label">Contact Us</AppText>
        <View className="w-11" />
      </View>

      <View className="rounded-[32px] bg-neutral-950 px-6 py-8">
        <AppText variant="screenTitle" tone="inverse" style={{ textAlign: 'center' }}>
          Contact Us
        </AppText>
        <AppText variant="body" tone="subtle" style={{ marginTop: 16, textAlign: 'center' }}>
          Have questions, feedback, or need help? We&apos;re here for you.
        </AppText>
      </View>

      <View className="gap-4">
        <Card>
          <View className="flex-row gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <Mail size={20} color="#171717" />
            </View>
            <View className="flex-1 gap-1">
              <AppText variant="cardTitle">Email</AppText>
              <AppText variant="bodySmall" tone="muted">
                2200521520026@ietlucknow.ac.in
              </AppText>
              <AppText variant="bodySmall" tone="muted">
                For technical issues and general inquiries.
              </AppText>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <MapPin size={20} color="#171717" />
            </View>
            <View className="flex-1 gap-1">
              <AppText variant="cardTitle">Address</AppText>
              <AppText variant="bodySmall" tone="muted">
                IET Lucknow
              </AppText>
              <AppText variant="bodySmall" tone="muted">
                Sitapur Road, Lucknow, Uttar Pradesh, India
              </AppText>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <Clock3 size={20} color="#171717" />
            </View>
            <View className="flex-1 gap-1">
              <AppText variant="cardTitle">Response Time</AppText>
              <AppText variant="bodySmall" tone="muted">
                We typically respond within 24 hours on weekdays.
              </AppText>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <MessageSquare size={20} color="#171717" />
            </View>
            <View className="flex-1 gap-1">
              <AppText variant="cardTitle">Feedback</AppText>
              <AppText variant="bodySmall" tone="muted">
                Have a feature suggestion or found a bug? We&apos;d love to hear from you.
              </AppText>
            </View>
          </View>
        </Card>
      </View>

      <Card>
        <View className="gap-4">
          <View className="gap-2">
            <AppText variant="sectionTitle">Send a Message</AppText>
            <AppText variant="bodySmall" tone="muted">
              This will open your mail app with the message pre-filled.
            </AppText>
          </View>

          <Input value={name} onChangeText={setName} placeholder="Your name" />
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@college.edu"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input value={subject} onChangeText={setSubject} placeholder="What&apos;s this about?" />
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            placeholder="Tell us more..."
            placeholderTextColor="#737373"
            className="min-h-32 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900"
          />

          <Button title="Send Message" onPress={sendMessage} />
        </View>
      </Card>

      <View className="gap-3">
        <AppText variant="sectionTitle">Frequently Asked Questions</AppText>
        <AppText variant="bodySmall" tone="muted">
          Quick answers to the most common questions from students and organizers.
        </AppText>
      </View>

      <View className="gap-4">
        {faqItems.map(item => (
          <Card key={item.question}>
            <View className="gap-2">
              <AppText variant="cardTitle">{item.question}</AppText>
              <AppText variant="bodySmall" tone="muted">
                {item.answer}
              </AppText>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
