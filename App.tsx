import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { VoiceProvider, useVoice } from './src/context/VoiceContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AudioFirstScreen } from './src/screens/AudioFirstScreen';

function AppContent() {
  const { audioFirstMode, setAudioFirstMode } = useVoice();
  
  // This handles the special "Audio First" mode if you toggle it
  if (audioFirstMode) {
    return <AudioFirstScreen onExit={() => setAudioFirstMode(false)} />;
  }

  // This loads your main tab navigation (Home, Bible, Rooms, etc.)
  return <AppNavigator />;
}

export default function App() {
  return (
    // VoiceProvider wraps the whole app so the voice settings work everywhere
    <VoiceProvider>
      <StatusBar style="light" />
      <AppContent />
    </VoiceProvider>
  );
}