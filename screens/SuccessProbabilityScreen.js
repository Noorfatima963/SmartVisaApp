import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';

export default function SuccessProbability({ navigation, route }) {
  // 1. Dashboard se Real Data Receive Karna
  const { userData } = route.params || {};

  // Default values (Safety ke liye, agar koi field khali ho)
  const country = userData?.selectedCountry || 'Unknown';
  const visa = userData?.visaType || 'Student';
  const cgpa = parseFloat(userData?.educationData?.cgpa || 0);
  const ielts = parseFloat(userData?.englishData?.ielts || 0);
  const budget = parseFloat(userData?.financialData?.budget || 0);
  const sponsor = userData?.financialData?.sponsor || 'None';

  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState([]); // Feedback points
  const [scoreColor, setScoreColor] = useState('#1A237E'); // Dynamic Color

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    calculateChance();
  }, []);

  // --- 🧠 AI LOGIC ENGINE ---
  const calculateChance = () => {
    let finalScore = 0;
    let feedback = [];

    // 1. BASE SCORE (Visa Type Factor)
    if (visa === 'Student') finalScore += 40; 
    else if (visa === 'Tourist') finalScore += 30; // Tourist thoda risky hota hai
    else finalScore += 35; // Work etc.

    // 2. COUNTRY DIFFICULTY FACTOR
    const strictCountries = ['USA', 'Canada', 'Australia', 'UK', 'Germany'];
    if (strictCountries.includes(country)) {
        // Strict countries mein bonus kam milta hai
        feedback.push(`ℹ️ ${country} has strict visa policies.`);
    } else {
        finalScore += 10; // Easier countries bonus
        feedback.push(`✅ ${country} has relatively relaxed policies.`);
    }

    // 3. ACADEMIC SCORE (CGPA)
    if (cgpa >= 3.5) {
        finalScore += 20;
        feedback.push("✅ Excellent Academic Record (High CGPA).");
    } else if (cgpa >= 3.0) {
        finalScore += 15;
        feedback.push("✅ Good CGPA, meets standard requirements.");
    } else if (cgpa >= 2.5) {
        finalScore += 5;
        feedback.push("⚠️ CGPA is average. Strong SOP required.");
    } else {
        feedback.push("❌ Low CGPA is a risk factor.");
    }

    // 4. LANGUAGE SCORE (IELTS)
    if (ielts >= 7.0) {
        finalScore += 20;
        feedback.push("✅ Strong English proficiency (7.0+).");
    } else if (ielts >= 6.5) {
        finalScore += 15;
        feedback.push("✅ IELTS 6.5 is a safe score.");
    } else if (ielts >= 6.0) {
        finalScore += 10;
        feedback.push("⚠️ IELTS 6.0 is the bare minimum.");
    } else {
        feedback.push("❌ Low IELTS score. Consider retaking.");
    }

    // 5. FINANCIAL SCORE (Budget)
    // $20,000+ is generally safe
    if (budget >= 30000) {
        finalScore += 20;
        feedback.push("✅ Very Strong Financial Background.");
    } else if (budget >= 20000) {
        finalScore += 15;
        feedback.push("✅ Budget is adequate for 1 year.");
    } else if (budget >= 10000) {
        finalScore += 5;
        feedback.push("⚠️ Budget is tight. Show strong bank statement.");
    } else {
        feedback.push("❌ Low Budget. High risk of refusal.");
    }

    // 6. SPONSOR FACTOR
    const strongSponsors = ['Father', 'Mother', 'Parents', 'Self'];
    // Agar sponsor Father/Mother/Self hain to plus point
    const isStrong = strongSponsors.some(s => sponsor.toLowerCase().includes(s.toLowerCase()));
    if (isStrong) {
        finalScore += 5;
        feedback.push("✅ Strong Sponsor relationship (Family).");
    }

    // SCORE CAPPING (0 - 99%)
    if (finalScore > 99) finalScore = 99;
    if (finalScore < 10) finalScore = 10;

    // COLOR LOGIC
    if (finalScore >= 80) setScoreColor('#4CAF50'); // Green (Excellent)
    else if (finalScore >= 60) setScoreColor('#FFD700'); // Gold (Good)
    else setScoreColor('#F44336'); // Red (Risk)

    setAnalysis(feedback);
    runAnimation(finalScore);
  };

  const runAnimation = (toValue) => {
    Animated.timing(animatedValue, {
      toValue: toValue,
      duration: 2500, // Thoda slow dramatic effect
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();

    animatedValue.addListener((v) => {
      setScore(Math.floor(v.value));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Visa Probability 📊</Text>
        <Text style={styles.subtitle}>AI Analysis for {country}</Text>

        {/* --- METER / CIRCLE --- */}
        <View style={[styles.circleContainer, { borderColor: scoreColor }]}>
          <View style={styles.circle}>
            <Animated.Text style={[styles.percentageText, { color: scoreColor }]}>
               {score}%
            </Animated.Text>
            <Text style={[styles.statusText, { color: scoreColor }]}>
              {score >= 80 ? "High Chance 🌟" : score >= 60 ? "Moderate Chance 👍" : "High Risk ⚠️"}
            </Text>
          </View>
        </View>

        {/* --- USER SUMMARY --- */}
        <View style={styles.summaryBox}>
           <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>CGPA</Text>
              <Text style={styles.summaryValue}>{cgpa}</Text>
           </View>
           <View style={styles.dividerVertical}/>
           <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>IELTS</Text>
              <Text style={styles.summaryValue}>{ielts}</Text>
           </View>
           <View style={styles.dividerVertical}/>
           <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Budget</Text>
              <Text style={styles.summaryValue}>${(budget/1000).toFixed(1)}k</Text>
           </View>
        </View>

        {/* --- AI FEEDBACK CARD --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why this score?</Text>
          <View style={styles.divider} />
          
          {analysis.map((item, index) => (
            <Text key={index} style={styles.point}>{item}</Text>
          ))}
          
          {score < 60 && (
             <Text style={styles.tipText}>💡 Tip: Try improving your IELTS score or increasing your budget to boost chances.</Text>
          )}
        </View>

        <View style={styles.btnContainer}>
          <PrimaryButton title="Back to Dashboard" onPress={() => navigation.goBack()} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContent: { padding: 20, alignItems: 'center' },
  
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', marginTop: 10 },
  subtitle: { color: '#666', marginBottom: 30, fontSize: 16 },
  
  circleContainer: { 
    width: 220, height: 220, 
    borderRadius: 110, 
    borderWidth: 12, 
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  circle: { alignItems: 'center' },
  percentageText: { fontSize: 56, fontWeight: 'bold' },
  statusText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },

  summaryBox: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    backgroundColor: '#fff', width: '100%', padding: 15, borderRadius: 15,
    elevation: 3, marginBottom: 20
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dividerVertical: { width: 1, height: '80%', backgroundColor: '#E0E0E0' },

  card: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 10 },
  point: { fontSize: 15, color: '#555', marginBottom: 8, lineHeight: 22 },
  
  tipText: { 
    marginTop: 15, padding: 10, backgroundColor: '#FFF3E0', 
    color: '#E65100', borderRadius: 8, fontSize: 13, fontStyle: 'italic' 
  },

  btnContainer: { width: '100%', marginTop: 30, marginBottom: 20 }
});