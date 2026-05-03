import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { getOnboardingDraft } from '../services/storage';

const ICON_MAP = {
  'passport': '🛂',
  'cv': '📄',
  'offer-letter': '📩',
  'bank-statement': '🏦',
  'english-proficiency': '📝',
  'transcripts': '🎓',
  'medical-certificate': '🏥',
  'police-clearance': '👮',
  'photos': '📸',
  'sop': '✍️',
  'recommendation-letters': '📧',
  'travel-insurance': '🛡️',
  'usa-i20': '🇺🇸',
  'uk-cas': '🇬🇧',
  'ca-acceptance-letter': '🇨🇦',
  'au-coe': '🇦🇺',
  'de-blocked-account': '🇩🇪',
};

const DEFAULT_ICON = '📄';

// Status mapping for better readability
const STATUS_MAP = {
  'MISSING': { label: 'Not Uploaded', color: '#999' },
  'PENDING': { label: 'Under Review ⏳', color: '#EF6C00' },
  'VERIFIED': { label: 'Verified ✅', color: 'green' },
  'REJECTED': { label: 'Rejected ❌', color: 'red' },
  'EXPIRED': { label: 'Expired ⚠️', color: '#D32F2F' },
};

export default function DocumentChecker({ navigation }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [targetCountry, setTargetCountry] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      // 1. Get target country (Try Profile API first, then Local Draft)
      let country = 'ALL';
      try {
        const profile = await api.profile.get();
        if (profile?.target_country) {
          country = profile.target_country;
        } else {
          const draft = await getOnboardingDraft();
          country = draft?.target_country || 'ALL';
        }
      } catch (err) {
        const draft = await getOnboardingDraft();
        country = draft?.target_country || 'ALL';
      }
      
      setTargetCountry(country);

      // 2. Fetch definitions and user documents in parallel
      const [definitions, userDocs] = await Promise.all([
        api.documents.getDefinitions({ country }),
        api.documents.list()
      ]);
      
      // 3. Merge definitions with user documents
      const mappedDocs = (definitions || []).map(def => {
        const userDoc = (userDocs || []).find(ud => ud.definition_slug === def.slug);
        
        return {
          id: def.id ? def.id.toString() : def.slug,
          slug: def.slug,
          name: def.name,
          description: def.description,
          status: userDoc ? userDoc.status : 'MISSING',
          ai_status: userDoc ? userDoc.ai_status : null,
          file_url: userDoc ? userDoc.file : null,
          icon: ICON_MAP[def.slug] || DEFAULT_ICON,
          is_mandatory: def.is_mandatory,
          rejection_reason: userDoc ? userDoc.rejection_reason || userDoc.ai_rejection_reason : null,
        };
      });

      setDocs(mappedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load document requirements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpload = async (doc) => {
    try {
      // 1. Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('definition_slug', doc.slug);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      // 3. Mark as "Scanning" locally for immediate feedback
      setDocs(prev => prev.map(d => 
        d.slug === doc.slug ? { ...d, status: 'PENDING', ai_status: 'PROCESSING' } : d
      ));

      // 4. Send to API
      await api.documents.upload(formData);
      
      Alert.alert('Success', `${doc.name} uploaded successfully. AI verification is in progress.`);
      
      // 5. Reload data to get updated status
      loadData();

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong during upload.');
      loadData(); // Revert local state
    }
  };

  const handleView = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Cannot open document link.');
      });
    }
  };

  const renderItem = ({ item }) => {
    const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: '#333' };
    const isProcessing = item.ai_status === 'PROCESSING';

    return (
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Text style={{fontSize: 24}}>{item.icon}</Text>
        </View>
        
        <View style={{flex: 1}}>
          <Text style={styles.docName}>{item.name}</Text>
          <View style={styles.badgeRow}>
            {item.is_mandatory && <Text style={styles.mandatoryBadge}>Mandatory</Text>}
            {item.status !== 'MISSING' && (
               <TouchableOpacity onPress={() => handleView(item.file_url)}>
                 <Text style={styles.viewLink}>View File 👁️</Text>
               </TouchableOpacity>
            )}
          </View>
          
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
             {isProcessing ? 'AI Verification in progress...' : statusInfo.label}
          </Text>
          
          {item.rejection_reason && (
            <Text style={styles.errorText}>Reason: {item.rejection_reason}</Text>
          )}
        </View>

        {/* Action Button */}
        {isProcessing ? (
          <ActivityIndicator color="#1A237E" />
        ) : (
          <TouchableOpacity 
            style={[styles.uploadBtn, item.status === 'VERIFIED' && { backgroundColor: '#4CAF50' }]} 
            onPress={() => handleUpload(item)}
          >
            <Text style={styles.uploadText}>
              {item.status === 'MISSING' ? 'Upload' : 'Replace'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doc Validator ({targetCountry}) 📑</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={styles.loadingText}>Loading requirements...</Text>
        </View>
      ) : (
        <>
          {/* Progress Bar Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Application Readiness</Text>
              <Text style={styles.scoreText}>{Math.round((docs.filter(d => d.status === 'VERIFIED').length / docs.length) * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(docs.filter(d => d.status === 'VERIFIED').length / docs.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressSub}>
                {docs.filter(d => d.status === 'VERIFIED').length} of {docs.length} mandatory documents verified
            </Text>
          </View>

          <FlatList
            data={docs}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onRefresh={() => loadData(true)}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No documents required for this selection.</Text>
              </View>
            }
          />
        </>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, 
    backgroundColor: '#1A237E', elevation: 5 
  },
  backBtn: { marginRight: 15 },
  backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#1A237E', fontWeight: '500' },

  progressSection: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  scoreText: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  progressBarBg: { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50' }, 
  progressSub: { marginTop: 8, color: '#666', fontSize: 12 },

  listContent: { padding: 15 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  iconBox: {
    width: 55, height: 55, borderRadius: 18, backgroundColor: '#F0F2F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  docName: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  mandatoryBadge: { fontSize: 10, color: '#D32F2F', backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 10 },
  viewLink: { fontSize: 11, color: '#1A237E', fontWeight: 'bold', textDecorationLine: 'underline' },
  
  statusText: { fontSize: 13, marginTop: 6, fontWeight: '600' },
  errorText: { fontSize: 11, color: '#D32F2F', marginTop: 4, fontStyle: 'italic' },

  uploadBtn: {
    backgroundColor: '#1A237E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginLeft: 10
  },
  uploadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  checkCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center'
  },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 }
});