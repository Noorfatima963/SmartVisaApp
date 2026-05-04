import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Modal, ScrollView,
  Animated, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { getOnboardingDraft } from '../services/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const STATUS_MAP = {
  MISSING:  { label: 'Not Uploaded',   color: '#999',    bg: '#F5F5F5' },
  PENDING:  { label: 'Under Review',   color: '#E65100', bg: '#FFF3E0' },
  VERIFIED: { label: 'Verified',       color: '#2E7D32', bg: '#E8F5E9' },
  REJECTED: { label: 'Issues Found',   color: '#C62828', bg: '#FFEBEE' },
  EXPIRED:  { label: 'Expired',        color: '#AD1457', bg: '#FCE4EC' },
};

const AI_STATUS_MAP = {
  PROCESSING: { label: 'AI Scanning…',        color: '#E65100', bg: '#FFF3E0', icon: '⏳' },
  PASSED:     { label: 'AI Verified',          color: '#2E7D32', bg: '#E8F5E9', icon: '✅' },
  FAILED:     { label: 'AI Check Failed',      color: '#C62828', bg: '#FFEBEE', icon: '❌' },
  MANUAL:     { label: 'Manual Review',        color: '#1565C0', bg: '#E3F2FD', icon: '👤' },
  null:       { label: 'Not yet analysed',     color: '#757575', bg: '#F5F5F5', icon: '—'  },
};

// AI check items derived from extracted_data / ai_status
const buildAiChecks = (doc) => [
  {
    label: 'Document readable & clear',
    pass: doc.ai_status !== 'FAILED' || doc.ai_extracted_data != null,
  },
  {
    label: 'Issuing authority recognised',
    pass: doc.ai_status === 'PASSED' || doc.ai_status === 'MANUAL',
  },
  {
    label: 'Date validity confirmed',
    pass: !doc.expiry_date || new Date(doc.expiry_date) > new Date(),
  },
  {
    label: 'Name matches application',
    pass: doc.ai_status === 'PASSED',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill badge */
const Badge = ({ label, color, bg }) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

/** Bottom-sheet wrapper with slide-up animation */
const BottomSheet = ({ visible, onClose, children }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* dim backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* handle */}
        <View style={styles.sheetHandle} />
        {children}
      </Animated.View>
    </Modal>
  );
};

// ─── View Document Modal ──────────────────────────────────────────────────────

const ViewDocModal = ({ visible, doc, onClose, onReplace }) => {
  if (!doc) return null;

  const handleOpen = () => {
    if (doc.file_url) {
      Linking.openURL(doc.file_url).catch(() =>
        Alert.alert('Error', 'Cannot open this document link.')
      );
    }
  };

  const ext = doc.file_url ? doc.file_url.split('.').pop().toUpperCase() : 'FILE';
  const filename = doc.file_url
    ? doc.file_url.split('/').pop()
    : `${doc.slug}.pdf`;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle} numberOfLines={1}>{doc.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* File preview card */}
      <View style={styles.previewCard}>
        <View style={styles.previewIconWrap}>
          <Text style={styles.previewIconText}>📄</Text>
        </View>
        <Text style={styles.previewFilename} numberOfLines={2}>{filename}</Text>
        <Text style={styles.previewExt}>{ext} Document</Text>
      </View>

      {/* Meta chips */}
      <View style={styles.metaRow}>
        {[
          { label: 'Format', value: ext },
          { label: 'Uploaded', value: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : '—' },
          { label: 'Status', value: STATUS_MAP[doc.status]?.label || doc.status },
        ].map((m) => (
          <View key={m.label} style={styles.metaChip}>
            <Text style={styles.metaChipLabel}>{m.label}</Text>
            <Text style={styles.metaChipValue}>{m.value}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.sheetActions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleOpen}>
          <Text style={styles.btnPrimaryText}>Open File</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => { onClose(); onReplace(doc); }}>
          <Text style={styles.btnSecondaryText}>Re-upload</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

// ─── AI Status Modal ──────────────────────────────────────────────────────────

const AiStatusModal = ({ visible, doc, onClose }) => {
  if (!doc) return null;

  const aiInfo = AI_STATUS_MAP[doc.ai_status] || AI_STATUS_MAP[null];
  const checks = buildAiChecks(doc);

  // Sanitise backend error messages (strip internal URLs / stack traces)
  const sanitiseReason = (reason) => {
    if (!reason) return null;
    if (reason.includes('Internal AI System Error') || reason.includes('HttpError')) {
      return 'The AI system encountered a temporary error. Our team has been notified. Please try re-uploading your document.';
    }
    return reason;
  };

  const displayReason = sanitiseReason(doc.ai_rejection_reason || doc.rejection_reason);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>AI Verification Status</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.62 }}>
        {/* Document tag */}
        <View style={styles.aiDocRow}>
          <View style={styles.aiDocIconWrap}>
            <Text style={{ fontSize: 20 }}>{doc.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiDocName} numberOfLines={2}>{doc.name}</Text>
            <Text style={styles.aiDocSub}>Automated document analysis</Text>
          </View>
        </View>

        {/* Overall status pill */}
        <View style={[styles.overallStatus, { backgroundColor: aiInfo.bg }]}>
          <Text style={styles.overallStatusDot}>●</Text>
          <Text style={[styles.overallStatusText, { color: aiInfo.color }]}>
            {aiInfo.icon}  {aiInfo.label}
          </Text>
        </View>

        {/* Confidence score */}
        {doc.ai_confidence_score != null && (
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence score</Text>
            <View style={styles.confidenceBarBg}>
              <View
                style={[
                  styles.confidenceBarFill,
                  {
                    width: `${Math.round(doc.ai_confidence_score * 100)}%`,
                    backgroundColor: doc.ai_confidence_score >= 0.75 ? '#2E7D32' : doc.ai_confidence_score >= 0.5 ? '#E65100' : '#C62828',
                  },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>{Math.round(doc.ai_confidence_score * 100)}%</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Check rows */}
        <Text style={styles.checksHeading}>Check Results</Text>
        {checks.map((c, i) => (
          <View key={i} style={styles.checkRow}>
            <Text style={[styles.checkIcon, { color: c.pass ? '#2E7D32' : '#C62828' }]}>
              {c.pass ? '✓' : '✗'}
            </Text>
            <Text style={styles.checkLabel}>{c.label}</Text>
            <Text style={[styles.checkResult, { color: c.pass ? '#2E7D32' : '#C62828' }]}>
              {c.pass ? 'Pass' : 'Fail'}
            </Text>
          </View>
        ))}

        {/* Rejection / note */}
        {displayReason ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteCardTitle}>⚠️  Action Required</Text>
            <Text style={styles.noteCardBody}>{displayReason}</Text>
          </View>
        ) : doc.ai_status === 'PASSED' ? (
          <View style={[styles.noteCard, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
            <Text style={[styles.noteCardTitle, { color: '#2E7D32' }]}>✅  All checks passed</Text>
            <Text style={[styles.noteCardBody, { color: '#388E3C' }]}>
              This document has been verified successfully. No further action is required.
            </Text>
          </View>
        ) : null}

        {/* Timestamp */}
        {doc.verified_at && (
          <Text style={styles.timestamp}>
            Verified: {new Date(doc.verified_at).toLocaleString()}
          </Text>
        )}
        {doc.updated_at && (
          <Text style={styles.timestamp}>
            Last updated: {new Date(doc.updated_at).toLocaleString()}
          </Text>
        )}

        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Footer action */}
      <View style={styles.sheetActions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={onClose}>
          <Text style={styles.btnPrimaryText}>Got it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => Alert.alert('Support', 'Opening support chat…')}
        >
          <Text style={styles.btnSecondaryText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DocumentChecker({ navigation }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [targetCountry, setTargetCountry] = useState('ALL');

  // Modal state
  const [viewDoc, setViewDoc]     = useState(null);
  const [statusDoc, setStatusDoc] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      let country = 'ALL';
      try {
        const profile = await api.profile.get();
        country = profile?.target_country || (await getOnboardingDraft())?.target_country || 'ALL';
      } catch {
        country = (await getOnboardingDraft())?.target_country || 'ALL';
      }
      setTargetCountry(country);

      const [definitions, rawUserDocs] = await Promise.all([
        api.documents.getDefinitions({ country }),
        api.documents.list(),
      ]);
      const userDocs = Array.isArray(rawUserDocs) ? rawUserDocs : (rawUserDocs?.results || []);

      const mappedDocs = (definitions || []).map((def) => {
        const userDoc = userDocs.find((ud) => ud.slug === def.slug || ud.definition_slug === def.slug);
        return {
          id: def.id ? def.id.toString() : def.slug,
          slug: def.slug,
          name: def.name,
          description: def.description,
          status: userDoc?.status ?? 'MISSING',
          ai_status: userDoc?.ai_status ?? null,
          ai_extracted_data: userDoc?.ai_extracted_data ?? null,
          ai_confidence_score: userDoc?.ai_confidence_score ?? null,
          ai_rejection_reason: userDoc?.ai_rejection_reason ?? null,
          file_url: userDoc?.file ?? null,
          icon: ICON_MAP[def.slug] || DEFAULT_ICON,
          is_mandatory: def.is_mandatory,
          rejection_reason: userDoc?.rejection_reason ?? null,
          verified_at: userDoc?.verified_at ?? null,
          updated_at: userDoc?.updated_at ?? null,
          expiry_date: userDoc?.expiry_date ?? null,
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
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append('definition_slug', doc.slug);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      setDocs((prev) =>
        prev.map((d) =>
          d.slug === doc.slug ? { ...d, status: 'PENDING', ai_status: 'PROCESSING' } : d
        )
      );

      await api.documents.upload(formData);
      Alert.alert('Uploaded', `${doc.name} uploaded. AI verification is in progress.`);
      loadData();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong during upload.');
      loadData();
    }
  };

  // ── Render list item ────────────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const statusInfo = STATUS_MAP[item.status] || { label: item.status, color: '#333', bg: '#eee' };
    const isProcessing = item.ai_status === 'PROCESSING';
    const isUploaded = item.status !== 'MISSING';

    return (
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 22 }}>{item.icon}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.docName} numberOfLines={2}>{item.name}</Text>

          <View style={styles.badgeRow}>
            {item.is_mandatory && (
              <Badge label="Mandatory" color="#C62828" bg="#FFEBEE" />
            )}
            {isUploaded && !isProcessing && (
              <Badge
                label={statusInfo.label}
                color={statusInfo.color}
                bg={statusInfo.bg}
              />
            )}
            {isProcessing && (
              <Badge label="Scanning…" color="#E65100" bg="#FFF3E0" />
            )}
          </View>

          {/* Uploaded: View + AI Status links */}
          {isUploaded && !isProcessing && (
            <View style={styles.linkRow}>
              <TouchableOpacity onPress={() => setViewDoc(item)} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>👁  View Document</Text>
              </TouchableOpacity>
              <Text style={styles.linkDivider}>·</Text>
              <TouchableOpacity onPress={() => setStatusDoc(item)} style={styles.linkBtn}>
                <Text style={styles.linkBtnText}>🤖  AI Status</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rejection note (non-AI, human review) */}
          {item.rejection_reason && !item.ai_rejection_reason && (
            <Text style={styles.errorText} numberOfLines={2}>
              ⚠ {item.rejection_reason}
            </Text>
          )}
        </View>

        {/* Action button */}
        <View style={styles.cardActions}>
          {isProcessing ? (
            <ActivityIndicator color="#1A237E" style={{ paddingHorizontal: 14 }} />
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                item.status === 'VERIFIED' && styles.uploadBtnVerified,
                item.status === 'REJECTED' && styles.uploadBtnRejected,
              ]}
              onPress={() => handleUpload(item)}
            >
              <Text style={styles.uploadText}>
                {item.status === 'MISSING' ? 'Upload' : 'Replace'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ── Summary stats ───────────────────────────────────────────────────────────

  const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
  const totalCount    = docs.length;
  const pct           = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────

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
          <Text style={styles.loadingText}>Loading requirements…</Text>
        </View>
      ) : (
        <FlatList
          data={docs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={() => loadData(true)}
          refreshing={refreshing}
          ListHeaderComponent={
            /* Progress section */
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Application Readiness</Text>
                <Text style={styles.scoreText}>{pct}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.progressSub}>
                {verifiedCount} of {totalCount} documents verified
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents required for this selection.</Text>
            </View>
          }
        />
      )}

      {/* Modals */}
      <ViewDocModal
        visible={!!viewDoc}
        doc={viewDoc}
        onClose={() => setViewDoc(null)}
        onReplace={handleUpload}
      />
      <AiStatusModal
        visible={!!statusDoc}
        doc={statusDoc}
        onClose={() => setStatusDoc(null)}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // Layout
  container:        { flex: 1, backgroundColor: '#F0F3FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { marginTop: 14, color: '#1A237E', fontWeight: '500' },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, backgroundColor: '#1A237E' },
  backBtn:     { marginRight: 14 },
  backText:    { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },

  // Progress
  progressSection: {
    margin: 14, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }),
  },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel:   { fontSize: 14, fontWeight: '600', color: '#333' },
  scoreText:       { fontSize: 18, fontWeight: '700', color: '#1A237E' },
  progressBarBg:   { height: 8, backgroundColor: '#E8EAF6', borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3949AB', borderRadius: 99 },
  progressSub:     { marginTop: 8, color: '#888', fontSize: 12 },

  // List
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 30 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 10,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#EEF0FA',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
  },
  docName:    { fontSize: 14, fontWeight: '700', color: '#1A237E', lineHeight: 19 },
  badgeRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 5, flexWrap: 'wrap', gap: 6 },
  cardActions:{ justifyContent: 'center', marginLeft: 8 },

  // Inline text links
  linkRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 7, flexWrap: 'wrap' },
  linkBtn:      { paddingVertical: 2 },
  linkBtnText:  { fontSize: 12, color: '#3949AB', fontWeight: '600' },
  linkDivider:  { marginHorizontal: 6, color: '#ccc', fontSize: 14 },

  errorText: { fontSize: 11, color: '#C62828', marginTop: 5, fontStyle: 'italic', lineHeight: 15 },

  // Badge
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: '600' },

  // Upload button
  uploadBtn:         { backgroundColor: '#1A237E', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 },
  uploadBtnVerified: { backgroundColor: '#2E7D32' },
  uploadBtnRejected: { backgroundColor: '#C62828' },
  uploadText:        { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText:      { color: '#999', fontSize: 15 },

  // ── Bottom sheet ──────────────────────────────────────────────────────────

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 60, 0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 12 }, android: { elevation: 16 } }),
  },
  sheetHandle: { width: 38, height: 4, borderRadius: 99, backgroundColor: '#DDD', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#EBEBEB' },
  sheetTitle:  { fontSize: 15, fontWeight: '700', color: '#1A237E', flex: 1, marginRight: 12 },
  closeBtn:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F3FB', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:{ fontSize: 13, color: '#555' },

  // ── View doc sheet ────────────────────────────────────────────────────────

  previewCard: {
    margin: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E8EAF6',
    borderStyle: 'dashed', padding: 24,
    alignItems: 'center', backgroundColor: '#F7F8FF',
  },
  previewIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  previewIconText: { fontSize: 28 },
  previewFilename: { fontSize: 13, fontWeight: '600', color: '#1A237E', textAlign: 'center', marginBottom: 4 },
  previewExt:      { fontSize: 11, color: '#888' },

  metaRow:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  metaChip:     { backgroundColor: '#F0F3FB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 90 },
  metaChipLabel:{ fontSize: 10, color: '#888', marginBottom: 2 },
  metaChipValue:{ fontSize: 12, fontWeight: '600', color: '#333' },

  // ── AI status sheet ───────────────────────────────────────────────────────

  aiDocRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#EBEBEB' },
  aiDocIconWrap:{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF0FA', alignItems: 'center', justifyContent: 'center' },
  aiDocName:    { fontSize: 13, fontWeight: '600', color: '#1A237E', lineHeight: 18 },
  aiDocSub:     { fontSize: 11, color: '#999', marginTop: 2 },

  overallStatus:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  overallStatusDot: { fontSize: 8, marginRight: 8 },
  overallStatusText:{ fontSize: 14, fontWeight: '700' },

  confidenceRow:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10, gap: 8 },
  confidenceLabel:  { fontSize: 11, color: '#888', width: 110 },
  confidenceBarBg:  { flex: 1, height: 6, backgroundColor: '#EBEBEB', borderRadius: 99, overflow: 'hidden' },
  confidenceBarFill:{ height: '100%', borderRadius: 99 },
  confidenceValue:  { fontSize: 12, fontWeight: '600', color: '#333', width: 36, textAlign: 'right' },

  divider:       { height: 0.5, backgroundColor: '#EBEBEB', marginHorizontal: 16, marginTop: 14 },
  checksHeading: { fontSize: 12, fontWeight: '700', color: '#888', marginHorizontal: 16, marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  checkRow:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 6, backgroundColor: '#F7F8FF', borderRadius: 10, padding: 10, gap: 10 },
  checkIcon:   { fontSize: 14, fontWeight: '700', width: 18, textAlign: 'center' },
  checkLabel:  { flex: 1, fontSize: 12, color: '#555' },
  checkResult: { fontSize: 11, fontWeight: '700' },

  noteCard:     { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFF8E1', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFE082' },
  noteCardTitle:{ fontSize: 12, fontWeight: '700', color: '#E65100', marginBottom: 5 },
  noteCardBody: { fontSize: 12, color: '#555', lineHeight: 18 },

  timestamp: { fontSize: 11, color: '#BBB', textAlign: 'center', marginTop: 10 },

  // ── Shared action row ─────────────────────────────────────────────────────

  sheetActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  btnPrimary:   { flex: 1, backgroundColor: '#1A237E', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  btnPrimaryText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  btnSecondary: { flex: 1, backgroundColor: '#EEF0FA', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 0.5, borderColor: '#C5CAE9' },
  btnSecondaryText: { color: '#1A237E', fontWeight: '600', fontSize: 14 },
});