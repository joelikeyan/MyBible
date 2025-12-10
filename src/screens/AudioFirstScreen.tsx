import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { useVoice } from '../context/VoiceContext';

export function AudioFirstScreen({ onExit }: { onExit: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const { selectedVoice } = useVoice();

  const currentContent = `Welcome to Audio-First Mode. 
  
Currently reading: John Chapter 3, Verse 16.

For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.

Say a command like "Read next verse" or "Open Psalms" to navigate.`;

  return (
    <View style={styles.container}>
      {/* Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Ionicons name="close" size={28} color="#F5E6D3" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>MyBible</Text>
        <Text style={styles.subtitle}>Audio-First Mode</Text>

        <View style={styles.textContainer}>
          <Text style={styles.mainText}>{currentContent}</Text>
        </View>

        {/* Big Speaker Button */}
        <View style={styles.speakerButton}>
          <SpeakerIcon text={currentContent} size={48} color="#FFFFFF" />
          <Text style={styles.speakerLabel}>Tap to Read Aloud</Text>
        </View>

        {/* Voice Info */}
        <Text style={styles.voiceInfo}>
          Using: {selectedVoice.name}
        </Text>
      </View>

      {/* Voice Command Button */}
      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={() => setIsListening(!isListening)}
      >
        <Ionicons
          name={isListening ? 'radio' : 'mic'}
          size={36}
          color="#FFFFFF"
        />
        <Text style={styles.micLabel}>
          {isListening ? 'Listening...' : 'Voice Command'}
        </Text>
      </TouchableOpacity>

      {/* Command Examples */}
      {isListening && (
        <View style={styles.commandHints}>
          <Text style={styles.hintTitle}>Try saying:</Text>
          <Text style={styles.hintText}>"Read next verse"</Text>
          <Text style={styles.hintText}>"Open Bible"</Text>
          <Text style={styles.hintText}>"Use my cloned voice"</Text>
          <Text style={styles.hintText}>"Join my Romans room"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F0A',
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 36,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#B8A080',
    marginBottom: 40,
  },
  textContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    maxWidth: '100%',
  },
  mainText: {
    fontSize: 24,
    color: '#F5E6D3',
    lineHeight: 36,
    textAlign: 'center',
  },
  speakerButton: {
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginBottom: 16,
  },
  speakerLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  voiceInfo: {
    color: '#8B7355',
    fontSize: 14,
  },
  micButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 40,
  },
  micButtonActive: {
    backgroundColor: '#E53935',
  },
  micLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  commandHints: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  hintTitle: {
    color: '#B8A080',
    fontSize: 14,
    marginBottom: 12,
  },
  hintText: {
    color: '#F5E6D3',
    fontSize: 16,
    marginBottom: 8,
  },
});

