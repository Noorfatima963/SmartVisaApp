import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const INITIAL_MESSAGE = {
  id:      '0',
  role:    'assistant',
  content: "Hi! I'm SmartVisa AI 🎓\n\nI've read your profile and I'm ready to help with university selection, visa advice, cost planning, and more.\n\nWhat would you like to know?",
};

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages]               = useState([INITIAL_MESSAGE]);
  const [input, setInput]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [suggestions, setSuggestions]         = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => { loadSuggestions(); }, []);

  async function loadSuggestions() {
    try {
      const data = await api.chatbot.suggestions();
      setSuggestions(data.suggestions || []);
    } catch { /* fail silently */ }
  }

  function getHistory() {
    return messages
      .filter(m => m.id !== '0')
      .map(m => ({ role: m.role, content: m.content }));
  }

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = {
      id:      Date.now().toString(),
      role:    'user',
      content: userText,
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.chatbot.message(userText, getHistory());

      const botMsg = {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: data.reply,
      };
      setMessages(prev => [...prev, botMsg]);

      // Gentle prompt if profile has missing fields
      if (data.missing_fields?.length > 0) {
        setMessages(prev => [...prev, {
          id:      (Date.now() + 2).toString(),
          role:    'assistant',
          content: `💡 Your answers will be more accurate if you add: ${data.missing_fields.map(f => f.label).join(', ')}. You can update these in your Profile.`,
        }]);
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: `Sorry, I couldn't connect right now. ${err?.message || 'Please try again.'}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function renderMessage({ item }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>SmartVisa AI 🤖</Text>
          <Text style={styles.headerSub}>Powered by Groq · Llama 3.3 70B</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={[...messages].reverse()}
          inverted
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          style={styles.flatList}
          ListHeaderComponent={
            loading ? (
              <View style={styles.typingRow}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#1A237E" />
                  <Text style={styles.typingText}>Thinking…</Text>
                </View>
              </View>
            ) : null
          }
        />

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsWrap}>
            <Text style={styles.suggestionsLabel}>Suggested questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about visas…"
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingTop: 20,
    backgroundColor: '#1A237E', elevation: 5,
  },
  backBtn:    { marginRight: 12 },
  backText:   { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  headerSub:  { color: '#9FA8DA', fontSize: 11, marginTop: 1 },
  onlineDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginLeft: 'auto' },

  flatList:     { flex: 1 },
  messagesList: { padding: 16, paddingTop: 8 },

  msgRow:     { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  msgRowUser: { flexDirection: 'row-reverse' },

  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 6,
  },

  bubble:         { maxWidth: '75%', borderRadius: 18, padding: 12 },
  bubbleBot:      { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 2 },
  bubbleUser:     { backgroundColor: '#1A237E', borderBottomRightRadius: 4 },
  bubbleText:     { fontSize: 14, color: '#333', lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },

  typingRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingLeft: 6 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2, gap: 8 },
  typingText:   { color: '#999', fontSize: 13 },

  suggestionsWrap:   { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#F5F8FF' },
  suggestionsLabel:  { fontSize: 11, color: '#999', paddingHorizontal: 16, marginBottom: 6 },
  suggestionsScroll: { paddingHorizontal: 12 },
  suggestionChip:    { backgroundColor: '#E8EAF6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 4, borderWidth: 1, borderColor: '#C5CAE9' },
  suggestionText:    { color: '#1A237E', fontSize: 12, fontWeight: '500' },

  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE', elevation: 8 },
  input:           { flex: 1, backgroundColor: '#F5F8FF', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#333', maxHeight: 100, borderWidth: 1, borderColor: '#E0E0E0' },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: '#C5CAE9' },
  sendIcon:        { color: '#fff', fontSize: 16 },
});
