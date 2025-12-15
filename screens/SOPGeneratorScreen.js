import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Clipboard, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SOPGenerator({ navigation, route }) {
  const { userData } = route.params || {};
  
  // Data Extraction
  const country = userData?.selectedCountry || "the UK";
  const degree = userData?.educationData?.degree || "my degree";
  
  const [generatedSOP, setGeneratedSOP] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);

  // --- SMART BACK LOGIC (Fixes Crash) ---
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard', params: { userData } }],
      });
    }
  };

  // --- AI WRITER LOGIC ---
  const generateSOP = () => {
    setLoading(true);
    setTimeout(() => {
      let text = "";
      if (tone === "Professional") {
        text = `Subject: Statement of Purpose\n\nDear Visa Officer,\n\nI am writing to express my sincere interest in pursuing higher education in ${country}. With a background in ${degree}, I am eager to advance my knowledge at a global level.\n\n${country} is known for its academic excellence, and I believe studying there will provide me with the skills necessary to contribute effectively to my home country's industry.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]`;
      } else {
        text = `Subject: My Dream to Study in ${country}\n\nDear Visa Officer,\n\nEver since I started my journey in ${degree}, I have dreamt of studying in ${country}. It is a hub of innovation and culture that I wish to be a part of.\n\nI am passionate, dedicated, and ready to work hard to achieve my academic goals. I plan to return home after my studies to make a difference.\n\nSincerely,\n[Your Name]`;
      }
      setGeneratedSOP(text);
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#C2185B" barStyle="light-content" />
      
      {/* Header with Smart Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{padding: 5}}>
            <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI SOP Writer ✍️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Choose Tone:</Text>
          <View style={styles.row}>
            {["Professional", "Passionate"].map((t) => (
              <TouchableOpacity key={t} onPress={() => setTone(t)} style={[styles.toneBtn, tone === t && styles.activeTone]}>
                <Text style={[styles.toneText, tone === t && {color:'#fff'}]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.genBtn} onPress={generateSOP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.genText}>Generate SOP ✨</Text>}
          </TouchableOpacity>
        </View>

        {generatedSOP ? (
          <View style={styles.resultCard}>
            <Text style={styles.label}>Your Draft:</Text>
            <TextInput style={styles.textArea} multiline value={generatedSOP} onChangeText={setGeneratedSOP} />
            <TouchableOpacity style={styles.copyBtn} onPress={() => { Clipboard.setString(generatedSOP); Alert.alert("Copied!"); }}>
              <Text style={styles.copyText}>📄 Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.placeholder}>Select a tone to generate your letter!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCE4EC' },
  header: { padding: 20, backgroundColor: '#C2185B', flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 28, marginRight: 15, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#880E4F' },
  row: { flexDirection: 'row', marginBottom: 20 },
  toneBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#C2185B', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  activeTone: { backgroundColor: '#C2185B' },
  toneText: { color: '#C2185B', fontWeight: 'bold' },
  genBtn: { backgroundColor: '#880E4F', padding: 15, borderRadius: 12, alignItems: 'center' },
  genText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3 },
  textArea: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 15, height: 250, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee', marginTop: 10 },
  copyBtn: { marginTop: 15, backgroundColor: '#2E7D32', padding: 12, borderRadius: 10, alignItems: 'center' },
  copyText: { color: '#fff', fontWeight: 'bold' },
  placeholder: { textAlign: 'center', color: '#888', marginTop: 50, fontSize: 16 }
});