import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { voiceService } from '../services/voiceService';
import { useVoice } from '../context/VoiceContext';

interface SpeakerIconProps {
  text: string;
  size?: number;
  color?: string;
  style?: object;
}

export function SpeakerIcon({ text, size = 20, color = '#6B4EFF', style }: SpeakerIconProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { selectedVoice } = useVoice();

  const handlePress = async () => {
    if (isSpeaking) {
      await voiceService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        await voiceService.speak(text, selectedVoice);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read aloud'}
      accessibilityRole="button"
    >
      {isSpeaking ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name="volume-high" size={size} color={color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    marginLeft: 8,
  },
});

