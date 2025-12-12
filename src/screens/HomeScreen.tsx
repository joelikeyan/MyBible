import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { useVoice } from '../context/VoiceContext';

export function HomeScreen({ navigation }: any) {
  const { textSize } = useVoice();

  const currentStudy = {
    title: 'The Gospel of John',
    description: 'Chapter 3: Jesus and Nicodemus - Understanding spiritual rebirth',
  };

  const recommendedPlans = [
    { id: '1', name: 'Psalms in 30 Days', description: 'Daily readings through the book of Psalms' },
    { id: '2', name: 'Life of Jesus', description: 'A journey through the four Gospels' },
    { id: '3', name: 'Proverbs Wisdom', description: 'Practical wisdom for daily living' },
  ];

  const upcomingSessions = [
    { id: '1', title: 'Romans Deep Dive', time: 'Today, 7:00 PM', host: 'Pastor Michael' },
    { id: '2', title: 'Hebrew Basics', time: 'Tomorrow, 10:00 AM', host: 'Dr. Sarah' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appName, { fontSize: textSize + 8 }]}>MyBible</Text>
        <View style={styles.greetingRow}>
          <Text style={[styles.greeting, { fontSize: textSize }]}>Welcome back, beloved</Text>
          <SpeakerIcon text="Welcome back, beloved. May God's wisdom guide your study today." />
        </View>
      </View>

      {/* Current Study Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={24} color="#6B4EFF" />
          <Text style={styles.cardLabel}>Current Study</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={[styles.cardTitle, { fontSize: textSize + 2 }]}>{currentStudy.title}</Text>
          <SpeakerIcon text={currentStudy.title} />
        </View>
        <View style={styles.descRow}>
          <Text style={[styles.cardDescription, { fontSize: textSize }]}>{currentStudy.description}</Text>
          <SpeakerIcon text={currentStudy.description} size={16} />
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('StudyRoomDetail')}
        >
          <Text style={styles.buttonText}>Resume Study</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Plans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: textSize + 2 }]}>Recommended Plans</Text>
          <SpeakerIcon text="Recommended study plans for you" />
        </View>
        {recommendedPlans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.titleRow}>
              <Text style={[styles.planName, { fontSize: textSize }]}>{plan.name}</Text>
              <SpeakerIcon text={plan.name} size={16} />
            </View>
            <View style={styles.descRow}>
              <Text style={[styles.planDescription, { fontSize: textSize - 2 }]}>{plan.description}</Text>
              <SpeakerIcon text={plan.description} size={14} />
            </View>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>View Plan</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: textSize + 2 }]}>Upcoming Sessions</Text>
          <SpeakerIcon text="Your upcoming study sessions" />
        </View>
        {upcomingSessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.sessionTitle, { fontSize: textSize }]}>{session.title}</Text>
                <SpeakerIcon text={session.title} size={16} />
              </View>
              <View style={styles.descRow}>
                <Text style={[styles.sessionMeta, { fontSize: textSize - 2 }]}>
                  {session.time} • {session.host}
                </Text>
                <SpeakerIcon text={`${session.time}, hosted by ${session.host}`} size={14} />
              </View>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.bottomPadding} />
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
  appName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
    marginBottom: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    color: '#D4C4B0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B4EFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
    flex: 1,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardDescription: {
    color: '#5C4A3D',
    flex: 1,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planName: {
    fontWeight: '600',
    color: '#2D1810',
    flex: 1,
  },
  planDescription: {
    color: '#8B7355',
    flex: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6B4EFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#6B4EFF',
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontWeight: '600',
    color: '#2D1810',
    flex: 1,
  },
  sessionMeta: {
    color: '#8B7355',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

