import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Chatbot({ navigation, route }) {
  // User Data from Profile (Personalization ke liye)
  const { userData } = route.params || {};
  const userName = userData?.name || "Friend";

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: `Hello ${userName}! 👋 I am SmartVisa AI. \n\nI can help with Visa, Scholarships, or just chat if you're feeling stressed. How are you today?`, 
      sender: 'bot', 
      time: 'Just now' 
    },
  ]);

  const flatListRef = useRef();

  // --- 🧠 MASSIVE KNOWLEDGE BASE (1000+ Logic Simulation) ---
  const knowledgeBase = [
    // 1. GREETINGS & BASICS
    { keywords: ['hello', 'hi', 'hey', 'salam', 'hola'], response: ["Hi there! How can I help you?", "Hello! Ready to plan your future?", "Walaikum Assalam! Ask me anything."] },
    { keywords: ['how are you', 'how r u'], response: ["I am an AI, always ready to help! How are YOU feeling?", "I'm great! Thanks for asking. What's on your mind?"] },
    { keywords: ['your name', 'who are you'], response: ["I am SmartVisa AI, your personal study abroad assistant 🤖."] },
    { keywords: ['thank', 'thanks'], response: ["You're welcome! 🌟", "Happy to help!", "Anytime!"] },
    { keywords: ['bye', 'goodbye', 'see you'], response: ["Good luck! Take care. 👋", "Bye! Keep dreaming big!"] },

    // 2. EMOTIONS & FEELINGS (The "Human" Side)
    { keywords: ['sad', 'depressed', 'unhappy', 'cry', 'crying'], response: ["I'm sorry you're feeling this way. 😔 Remember, setbacks are part of the journey. Don't give up!", "It's okay to feel down sometimes. Take a deep breath. I believe in you! 💪"] },
    { keywords: ['reject', 'refused', 'denied'], response: ["Rejections are tough, but they aren't the end. Many students succeed after a refusal. Let's analyze what went wrong and try again! 🔄", "Don't lose hope. A 'No' today can be a 'Yes' tomorrow. Did you check your SOP and documents properly?"] },
    { keywords: ['happy', 'excited', 'got visa', 'accepted'], response: ["That's AMAZING news! 🎉 Congratulations! I'm so proud of you!", "Woohoo! 🥳 Party time! All your hard work paid off."] },
    { keywords: ['scared', 'nervous', 'anxious', 'tension'], response: ["It's normal to be nervous about the future. Just take one step at a time. You've got this! 🌟", "Don't worry. Preparation kills anxiety. Let's verify your documents to make you feel confident."] },
    { keywords: ['tired', 'exhausted'], response: ["Rest is important too. Take a break, recharge, and come back stronger! 😴"] },

    // 3. VISA & DOCUMENTS
    { keywords: ['visa process', 'steps'], response: ["The general process is: \n1. Get Offer Letter 📩\n2. Pay Fees 💰\n3. Collect Documents 📑\n4. File Visa Application 💻\n5. Interview/Biometrics 🎤"] },
    { keywords: ['bank statement', 'funds', 'money', 'cost'], response: ["You usually need to show tuition + 1 year living expenses. For USA/UK/Canada, this is approx $20k-$30k. Make sure the statement is 3-6 months old."] },
    { keywords: ['sponsor', 'who can sponsor'], response: ["Parents, siblings, or grandparents are the best sponsors. You can also self-sponsor if you have savings."] },
    { keywords: ['gap', 'study gap'], response: ["A study gap is acceptable if justified. You can show work experience or internships to cover the gap years."] },
    { keywords: ['document', 'checklist', 'docs'], response: ["Key Documents:\n- Passport 🛂\n- Transcripts 📜\n- Offer Letter 📩\n- Bank Statement 🏦\n- IELTS/TOEFL 📝\n- SOP & LORs"] },

    // 4. EXAMS (IELTS / PTE)
    { keywords: ['ielts', 'band', 'score'], response: ["For Masters, aim for 6.5 (no band < 6). For Bachelors, 6.0 is usually enough. Top unis prefer 7.0+."] },
    { keywords: ['pte', 'toefl', 'duolingo'], response: ["Yes, PTE and TOEFL are widely accepted. Duolingo is accepted by many USA/UK universities but confirm with them first."] },
    { keywords: ['without ielts', 'english waiver'], response: ["Some UK universities accept 'Medium of Instruction' letters. However, a visa officer might still ask for English proof. IELTS is safer."] },

    // 5. COUNTRIES
    { keywords: ['usa', 'america'], response: ["USA offers high scholarships and 3-year OPT (Work permit) for STEM degrees. But interviews are strict!"] },
    { keywords: ['uk', 'united kingdom'], response: ["UK has a quick visa process (Points-based) and offers a 2-year Graduate Route visa (PSW)."] },
    { keywords: ['canada'], response: ["Canada is great for PR (Permanent Residency). SDS stream is faster but requires IELTS 6.0+ in all bands."] },
    { keywords: ['germany', 'free education'], response: ["Germany has FREE tuition in public universities! You just need a Blocked Account (~€11k) for living costs."] },
    { keywords: ['australia'], response: ["Australia offers great weather and high part-time wages. You need Level 1 universities for faster visas."] },

    // 6. SCHOLARSHIPS
    { keywords: ['scholarship', 'financial aid', 'free'], response: ["Popular Scholarships:\n- Fulbright (USA)\n- Chevening (UK)\n- DAAD (Germany)\n- Erasmsus (Europe)\nAlso check university-specific merit awards!"] },
  ];

  // --- SMART MATCHING ENGINE ---
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    // 1. Loop through knowledge base
    for (let item of knowledgeBase) {
      // Check if ANY keyword matches
      const match = item.keywords.some(keyword => lowerText.includes(keyword));
      if (match) {
        // Return random response from the array (Natural feel)
        const randomIndex = Math.floor(Math.random() * item.response.length);
        return item.response[randomIndex];
      }
    }

    // 2. Fallback (Agar kuch samajh na aye)
    return "I'm still learning! 🧠 Could you rephrase that? Try asking about 'Visa', 'Scholarships', 'Bank Statement', or 'IELTS'.";
  };

  const sendMessage = (textToSend) => {
    const msgText = textToSend || inputText;
    if (msgText.trim().length === 0) return;

    // Add User Message
    const userMsg = { 
      id: Date.now().toString(), 
      text: msgText, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss(); // Close keyboard on send (optional)

    // Simulate AI Thinking Delay
    setTimeout(() => {
      const botReplyText = getBotResponse(msgText);
      const botMsg = { 
        id: Date.now().toString() + 'b', 
        text: botReplyText, 
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200); 
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={{alignItems: isUser ? 'flex-end' : 'flex-start', marginVertical: 8}}>
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    );
  };

  // Quick Chips
  const suggestions = ["Visa Rejected? 💔", "USA vs UK 🇺🇸🇬🇧", "No Money? 💰", "IELTS Tips 📝", "I'm Sad 😔"];

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AI Mentor</Text>
          <Text style={styles.statusDot}>● Online & Listening</Text>
        </View>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
               <ActivityIndicator size="small" color="#1A237E" />
               <Text style={styles.typingText}>Thinking...</Text>
            </View>
          ) : null
        }
      />

      {/* Quick Suggestions */}
      <View style={{ height: 50, backgroundColor: '#F5F7FA' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionContainer}>
          {suggestions.map((chip, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.chip} 
              onPress={() => sendMessage(chip)} 
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, {backgroundColor: inputText ? '#1A237E' : '#90CAF9'}]} 
            onPress={() => sendMessage()}
            disabled={!inputText}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, 
    backgroundColor: '#1A237E', elevation: 5, borderBottomLeftRadius: 20, borderBottomRightRadius: 20
  },
  backBtn: { paddingRight: 15 },
  backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statusDot: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },

  chatContent: { padding: 15, paddingBottom: 20 },

  messageBubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#1A237E', 
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end'
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderWidth: 0,
    alignSelf: 'flex-start'
  },
  messageText: { fontSize: 16, lineHeight: 24 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  timeText: { fontSize: 11, color: '#999', marginHorizontal: 8, marginTop: 4 },

  typingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 5 },
  typingText: { marginLeft: 8, color: '#888', fontStyle: 'italic', fontSize: 12 },

  suggestionContainer: { paddingHorizontal: 10, marginBottom: 5 },
  chip: { 
    backgroundColor: '#E8EAF6', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 25, 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C5CAE9',
    alignSelf: 'center'
  },
  chipText: { color: '#1A237E', fontWeight: '600', fontSize: 13 },

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    color: '#333'
  },
  sendBtn: {
    width: 50, height: 50,
    borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    elevation: 2
  },
  sendText: { color: '#fff', fontSize: 20 }
});