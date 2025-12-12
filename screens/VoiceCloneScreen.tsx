import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';
import { PremiumButton } from '../components/PremiumButton';
import { GlassCard } from '../components/GlassCard';
import { ElevenLabsService, Voice } from '../services/ElevenLabsService';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export const VoiceCloneScreen = () => {
  const { theme } = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoading(true);
    const fetched = await ElevenLabsService.getVoices();
    setVoices(fetched);
    const saved = await AsyncStorage.getItem('active_voice_id');
    if (saved) setSelectedVoiceId(saved);
    setLoading(false);
  };

  const handleSelectVoice = async (id: string) => {
    setSelectedVoiceId(id);
    await AsyncStorage.setItem('active_voice_id', id);
  };

  const pickAudioAndClone = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      // Prompt for name
      const name = "My Cloned Voice " + Math.floor(Math.random() * 100);
      // In a real app we'd have a text input dialog.

      setCloning(true);
      const newVoice = await ElevenLabsService.addVoice(name, result.assets[0].uri);

      if (newVoice) {
        setVoices(prev => [newVoice, ...prev]);
        handleSelectVoice(newVoice.voice_id);
        Alert.alert('Success', 'Voice cloned successfully!');
      } else {
        Alert.alert('Error', 'Failed to clone voice.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setCloning(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecordingAndClone = async () => {
    if (!recording) return;
    setCloning(true);
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (!uri) throw new Error('No URI');

        const name = "My Recorded Voice " + Math.floor(Math.random() * 100);
        const newVoice = await ElevenLabsService.addVoice(name, uri);
        if (newVoice) {
            setVoices(prev => [newVoice, ...prev]);
            handleSelectVoice(newVoice.voice_id);
            Alert.alert('Success', 'Voice cloned from recording!');
        } else {
             Alert.alert('Error', 'Failed to clone voice.');
        }
    } catch (error) {
        console.error(error);
    } finally {
        setRecording(null);
        setCloning(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText variant="h1" style={styles.header}>Voice Cloning Center</ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Create a digital replica of your voice to read the Scriptures with you.
        </ThemedText>

        <GlassCard style={styles.actionCard}>
          <ThemedText variant="h3" style={{ marginBottom: 16 }}>Create New Voice</ThemedText>

          <PremiumButton
            title={recording ? "Stop Recording & Clone" : "Record Voice Sample"}
            onPress={recording ? stopRecordingAndClone : startRecording}
            variant="outline"
            icon={<Ionicons name={recording ? "stop" : "mic"} size={20} color={theme.accent as string} />}
            loading={cloning && !!recording}
            style={{ marginBottom: 12 }}
          />

          <PremiumButton
            title="Upload Audio File"
            onPress={pickAudioAndClone}
            variant="primary"
            icon={<Ionicons name="cloud-upload" size={20} color="#000" />}
            loading={cloning && !recording}
          />
        </GlassCard>

        <ThemedText variant="h2" style={styles.sectionTitle}>Available Voices</ThemedText>

        {loading ? <ActivityIndicator size="large" color={theme.accent} /> : (
          voices.map((voice) => (
            <GlassCard key={voice.voice_id} style={[
                styles.voiceCard,
                selectedVoiceId === voice.voice_id && { borderColor: theme.accent, borderWidth: 2 }
            ]}>
              <View style={styles.voiceInfo}>
                <Ionicons name="person-circle-outline" size={40} color={theme.text as string} />
                <View style={{ marginLeft: 12 }}>
                    <ThemedText variant="h3">{voice.name}</ThemedText>
                    <ThemedText variant="caption">ID: {voice.voice_id.slice(0, 8)}...</ThemedText>
                </View>
              </View>
              {selectedVoiceId === voice.voice_id ? (
                  <Ionicons name="checkmark-circle" size={24} color={theme.accent as string} />
              ) : (
                  <PremiumButton
                    title="Select"
                    onPress={() => handleSelectVoice(voice.voice_id)}
                    variant="secondary"
                    style={{ height: 36, width: 80 }}
                  />
              )}
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  actionCard: {
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
  },
  voiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
