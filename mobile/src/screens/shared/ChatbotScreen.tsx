import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { RotateCcw, Send, Sparkles, User2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendChatMessages, type ChatMessagePayload } from '@/api/chat.api';
import { Header } from '@/components/layout/Header';
import { AppText } from '@/components/ui/Typography';
import { getErrorMessage } from '@/utils/errors';

interface ChatMessage extends ChatMessagePayload {
  id: string;
}

type ChatbotNavigation = {
  goBack: () => void;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey there! I'm Eeva — your personal EventEase guide. I know everything about events, registration, certificates, and more. Ask me anything!",
};

const QUICK_PROMPTS = [
  { label: 'Register for event', text: 'How do I register for an event?' },
  { label: 'Get certificate', text: 'How do I get my certificate?' },
  { label: 'Organizer tools', text: 'What can organizers do?' },
  { label: 'QR attendance', text: 'How does QR attendance work?' },
];

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatbotScreen({ navigation }: { navigation: ChatbotNavigation }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, loading]);

  const apiMessages = useMemo(
    () => messages.filter(message => message.id !== 'welcome').map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const appendAssistantMessage = (content: string) => {
    setMessages(current => [
      ...current,
      {
        id: buildId('assistant'),
        role: 'assistant',
        content,
      },
    ]);
  };

  const sendMessage = async (draft: string) => {
    const trimmed = draft.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: buildId('user'),
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessages(
        nextMessages
          .filter(message => message.id !== 'welcome')
          .map(({ role, content }) => ({ role, content })),
      );
      appendAssistantMessage(response.message);
    } catch (error) {
      appendAssistantMessage(
        getErrorMessage(error, 'Eeva is taking a short break right now. Please try again in a moment.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View className="flex-1 px-5 py-4">
          <Header title="Eeva" subtitle="Your EventEase guide for events, registrations, and certificates." />

          <View className="mt-4 flex-1 overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/40">
            <View className="flex-row items-center justify-between border-b border-violet-100 bg-violet-600 px-4 py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-violet-400">
                  <Sparkles size={20} color="#ffffff" />
                </View>
                <View>
                  <AppText variant="cardTitle" tone="inverse">
                    Eeva
                  </AppText>
                  <AppText variant="caption" tone="subtle">
                    {loading ? 'Typing a reply...' : 'Your EventEase guide'}
                  </AppText>
                </View>
              </View>

              <Pressable onPress={resetChat}>
                <View className="rounded-2xl bg-white/15 p-2.5">
                  <RotateCcw size={18} color="#ffffff" />
                </View>
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 16 }}>
              {messages.map(message => (
                <View
                  key={message.id}
                  className={`flex-row gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' ? (
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-violet-200">
                      <Sparkles size={14} color="#6d28d9" />
                    </View>
                  ) : null}

                  <View
                    className={`max-w-[78%] rounded-3xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'rounded-tr-xl bg-neutral-900'
                        : 'rounded-tl-xl border border-violet-100 bg-white'
                    }`}>
                    <AppText
                      variant="bodySmall"
                      tone={message.role === 'user' ? 'inverse' : 'default'}>
                      {message.content}
                    </AppText>
                  </View>

                  {message.role === 'user' ? (
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                      <User2 size={14} color="#171717" />
                    </View>
                  ) : null}
                </View>
              ))}

              {loading ? (
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-violet-200">
                    <Sparkles size={14} color="#6d28d9" />
                  </View>
                  <View className="rounded-3xl rounded-tl-xl border border-violet-100 bg-white px-4 py-3">
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator size="small" color="#6d28d9" />
                      <AppText variant="caption" tone="muted">
                        Eeva is thinking...
                      </AppText>
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {messages.length === 1 ? (
              <View className="gap-2 border-t border-violet-100 bg-white px-4 py-4">
                <AppText variant="overline" tone="primary">
                  Suggested Questions
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {QUICK_PROMPTS.map(prompt => (
                    <Pressable key={prompt.text} onPress={() => sendMessage(prompt.text)}>
                      <View className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2">
                        <AppText variant="caption" tone="primary">
                          {prompt.label}
                        </AppText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="border-t border-violet-100 bg-white px-4 py-4">
              <View className="flex-row items-end gap-3 rounded-3xl border border-violet-200 bg-violet-50 px-3 py-3">
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask Eeva anything..."
                  placeholderTextColor="#8b5cf6"
                  multiline
                  textAlignVertical="top"
                  className="max-h-28 flex-1 bg-transparent text-base text-neutral-900"
                />
                <Pressable onPress={() => sendMessage(input)} disabled={!input.trim() || loading}>
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-full ${
                      !input.trim() || loading ? 'bg-violet-200' : 'bg-violet-600'
                    }`}>
                    <Send size={18} color="#ffffff" />
                  </View>
                </Pressable>
              </View>
              <AppText variant="caption" tone="muted" style={{ marginTop: 10, textAlign: 'center' }}>
                Powered by Eeva AI and EventEase
              </AppText>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
