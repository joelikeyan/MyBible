import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { useVoice } from '../context/VoiceContext';
import Slider from '@react-native-community/slider';

export function ProfileScreen() {
  const {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    audioFirstMode,
    setAudioFirstMode,
    voices,
    selectedVoice,
    setSelectedVoice,
  } = useVoice();

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const narrators = voices.filter(v => v.type === 'narrator');
  const clonedVoices = voices.filter(v => v.type === 'clone');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileText}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { fontSize: textSize + 4 }]}>John Doe</Text>
              <SpeakerIcon text="John Doe" color="#F5E6D3" />
            </View>
            <View style={styles.taglineRow}>
              <Text style={styles.tagline}>Seeking wisdom in the Word</Text>
              <SpeakerIcon text="Seeking wisdom in the Word" color="#D4C4B0" size={14} />
            </View>
          </View>
        </View>
      </View>

      {/* Voice & Audio Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="volume-high" size={22} color="#6B4EFF" />
          <Text style={[styles.sectionTitle, { fontSize: textSize + 2 }]}>Voice & Audio</Text>
          <SpeakerIcon text="Voice and audio settings. Choose your preferred voice for reading." />
        </View>

        <View style={styles.card}>
          <View style={styles.descRow}>
            <Text style={[styles.description, { fontSize: textSize - 1 }]}>
              Choose how the Bible and all text is read aloud. Use your own cloned voice,
              upload a voice sample, or select from our narrator voices.
            </Text>
            <SpeakerIcon
              text="Choose how the Bible and all text is read aloud. Use your own cloned voice, upload a voice sample, or select from our narrator voices."
              size={16}
            />
          </View>

          {/* Narrator Voices */}
          <Text style={styles.subsectionTitle}>Narrator Voices</Text>
          {narrators.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceOption,
                selectedVoice.id === voice.id && styles.selectedVoice,
              ]}
              onPress={() => setSelectedVoice(voice)}
            >
              <View style={styles.radioOuter}>
                {selectedVoice.id === voice.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.voiceInfo}>
                <Text style={[styles.voiceName, { fontSize: textSize }]}>{voice.name}</Text>
                <Text style={styles.voiceDesc}>{voice.description}</Text>
              </View>
              <SpeakerIcon text={`${voice.name}. ${voice.description}`} size={16} />
            </TouchableOpacity>
          ))}

          {/* Cloned Voices */}
          {clonedVoices.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Your Cloned Voices</Text>
              {clonedVoices.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.voiceOption,
                    selectedVoice.id === voice.id && styles.selectedVoice,
                  ]}
                  onPress={() => setSelectedVoice(voice)}
                >
                  <View style={styles.radioOuter}>
                    {selectedVoice.id === voice.id && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.voiceInfo}>
                    <Text style={[styles.voiceName, { fontSize: textSize }]}>{voice.name}</Text>
                    <Text style={styles.voiceDesc}>{voice.description}</Text>
                  </View>
                  <SpeakerIcon text={`Preview ${voice.name}`} size={16} />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Voice Clone Actions */}
          <View style={styles.voiceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRecordModal(true)}
            >
              <Ionicons name="mic" size={20} color="#6B4EFF" />
              <Text style={styles.actionButtonText}>Record Voice Sample</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="cloud-upload" size={20} color="#6B4EFF" />
              <Text style={styles.actionButtonText}>Upload Voice Sample</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadInfo}>
            <Text style={styles.uploadInfoText}>
              Supported formats: MP3, WAV, M4A. Minimum 30 seconds of clear speech.
            </Text>
            <SpeakerIcon
              text="Supported formats: MP3, WAV, M4A. Minimum 30 seconds of clear speech."
              size={14}
            />
          </View>
        </View>
      </View>

      {/* Accessibility Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="accessibility" size={22} color="#6B4EFF" />
          <Text style={[styles.sectionTitle, { fontSize: textSize + 2 }]}>Accessibility</Text>
          <SpeakerIcon text="Accessibility settings for easier reading and navigation" />
        </View>

        <View style={styles.card}>
          {/* Text Size */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { fontSize: textSize }]}>Text Size</Text>
              <Text style={styles.settingDesc}>Adjust the size of all text</Text>
            </View>
            <SpeakerIcon text={`Text size is currently ${textSize}`} size={16} />
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>A</Text>
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={24}
                value={textSize}
                onValueChange={setTextSize}
                minimumTrackTintColor="#6B4EFF"
                maximumTrackTintColor="#E8DDD4"
                thumbTintColor="#6B4EFF"
              />
            </View>
            <Text style={[styles.sliderLabel, { fontSize: 20 }]}>A</Text>
          </View>

          {/* High Contrast */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { fontSize: textSize }]}>High Contrast</Text>
              <Text style={styles.settingDesc}>Increase color contrast for better visibility</Text>
            </View>
            <SpeakerIcon text="High contrast mode for better visibility" size={16} />
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#E8DDD4', true: '#B8A0FF' }}
              thumbColor={highContrast ? '#6B4EFF' : '#FFFFFF'}
            />
          </View>

          {/* Audio-First Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { fontSize: textSize }]}>Audio-First Mode</Text>
              <Text style={styles.settingDesc}>Large text, minimal UI, voice commands</Text>
            </View>
            <SpeakerIcon text="Audio first mode with large text and voice commands" size={16} />
            <Switch
              value={audioFirstMode}
              onValueChange={setAudioFirstMode}
              trackColor={{ false: '#E8DDD4', true: '#B8A0FF' }}
              thumbColor={audioFirstMode ? '#6B4EFF' : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={22} color="#6B4EFF" />
          <Text style={[styles.sectionTitle, { fontSize: textSize + 2 }]}>Account</Text>
          <SpeakerIcon text="Account and general settings" />
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-circle" size={22} color="#5C4A3D" />
            <Text style={[styles.menuText, { fontSize: textSize }]}>Account Info</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B7355" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications" size={22} color="#5C4A3D" />
            <Text style={[styles.menuText, { fontSize: textSize }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B7355" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={22} color="#5C4A3D" />
            <Text style={[styles.menuText, { fontSize: textSize }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B7355" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle" size={22} color="#5C4A3D" />
            <Text style={[styles.menuText, { fontSize: textSize }]}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B7355" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />

      {/* Record Voice Modal */}
      <Modal visible={showRecordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Voice Sample</Text>
              <TouchableOpacity onPress={() => setShowRecordModal(false)}>
                <Ionicons name="close" size={24} color="#2D1810" />
              </TouchableOpacity>
            </View>

            <View style={styles.recordInstructions}>
              <Text style={styles.instructionText}>
                Read the following passage clearly and naturally. Speak for at least 30 seconds
                to create a quality voice clone.
              </Text>
              <SpeakerIcon
                text="Read the following passage clearly and naturally. Speak for at least 30 seconds to create a quality voice clone."
              />
            </View>

            <View style={styles.sampleText}>
              <Text style={styles.sampleTextContent}>
                "For God so loved the world that he gave his one and only Son, that whoever
                believes in him shall not perish but have eternal life."
              </Text>
            </View>

            <View style={styles.recordControls}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingActive]}
                onPress={() => setIsRecording(!isRecording)}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.recordTimer}>
                {isRecording ? '00:15' : 'Tap to start'}
              </Text>
            </View>

            {isRecording && (
              <View style={styles.waveform}>
                <Text style={styles.waveformPlaceholder}>🎵 Recording...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2D1810',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tagline: {
    color: '#D4C4B0',
    fontSize: 14,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  description: {
    color: '#5C4A3D',
    flex: 1,
    lineHeight: 22,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedVoice: {
    backgroundColor: '#F0EBFF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6B4EFF',
  },
  voiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voiceName: {
    fontWeight: '600',
    color: '#2D1810',
  },
  voiceDesc: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  voiceActions: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#6B4EFF',
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#6B4EFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F0EA',
    borderRadius: 8,
  },
  uploadInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#8B7355',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontWeight: '600',
    color: '#2D1810',
  },
  settingDesc: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 2,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#5C4A3D',
    width: 24,
    textAlign: 'center',
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    color: '#2D1810',
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
  },
  recordInstructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#5C4A3D',
    lineHeight: 22,
  },
  sampleText: {
    backgroundColor: '#F5F0EA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sampleTextContent: {
    fontSize: 16,
    color: '#2D1810',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  recordControls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recordingActive: {
    backgroundColor: '#E53935',
  },
  recordTimer: {
    fontSize: 16,
    color: '#5C4A3D',
    fontWeight: '500',
  },
  waveform: {
    height: 60,
    backgroundColor: '#F5F0EA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformPlaceholder: {
    fontSize: 16,
    color: '#6B4EFF',
  },
});

