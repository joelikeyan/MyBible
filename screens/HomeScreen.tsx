import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';
import { GlassCard } from '../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
            <View>
                <ThemedText variant="h1">Welcome back,</ThemedText>
                <ThemedText variant="h1" style={{ color: theme.accent }}>Joshua</ThemedText>
            </View>
            <Ionicons name="notifications-outline" size={28} color={theme.text as string} />
        </View>

        {/* Featured Card */}
        <GlassCard style={styles.featuredCard}>
            <View style={styles.featuredContent}>
                <ThemedText variant="label" style={{ color: '#FFF', opacity: 0.8 }}>Resume Study</ThemedText>
                <ThemedText variant="h2" style={{ color: '#FFF', marginTop: 8 }}>The Gospel of John</ThemedText>
                <ThemedText variant="body" style={{ color: '#FFF', opacity: 0.9, marginTop: 4 }}>Chapter 3 • Verse 16</ThemedText>

                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                    <Ionicons name="people" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <ThemedText style={{ color: '#FFF', fontSize: 12 }}>12 Active in Room</ThemedText>
                </View>
            </View>
            {/* Decorative Icon */}
            <Ionicons name="book" size={120} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </GlassCard>

        {/* Recommended Plans */}
        <ThemedText variant="h3" style={styles.sectionTitle}>Recommended Plans</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {[1, 2, 3].map((i) => (
                <GlassCard key={i} style={styles.planCard}>
                    <View style={{ height: 100, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 10, borderRadius: 8 }} />
                    <ThemedText variant="h3">Psalms of Peace</ThemedText>
                    <ThemedText variant="caption">7 Days • Devotional</ThemedText>
                </GlassCard>
            ))}
        </ScrollView>

        {/* Upcoming Sessions */}
        <ThemedText variant="h3" style={styles.sectionTitle}>Upcoming Sessions</ThemedText>
        {[1, 2].map((i) => (
            <GlassCard key={i} style={styles.sessionCard}>
                <View style={styles.dateBox}>
                    <ThemedText variant="h3" style={{ color: theme.accent }}>12</ThemedText>
                    <ThemedText variant="label">OCT</ThemedText>
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <ThemedText variant="h3">Romans Deep Dive</ThemedText>
                    <ThemedText variant="caption">Hosted by Pastor Michael</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary as string} />
            </GlassCard>
        ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
      padding: 20,
      paddingTop: 60,
      paddingBottom: 100,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 30,
  },
  featuredCard: {
      height: 200,
      backgroundColor: '#4A3B69', // Fallback color
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
  },
  featuredContent: {
      zIndex: 2,
  },
  bgIcon: {
      position: 'absolute',
      right: -20,
      bottom: -20,
      zIndex: 1,
  },
  sectionTitle: {
      marginTop: 30,
      marginBottom: 16,
  },
  horizontalList: {
      marginHorizontal: -20,
      paddingHorizontal: 20,
  },
  planCard: {
      width: 160,
      height: 200,
      marginRight: 16,
      padding: 12,
  },
  sessionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 12,
  },
  dateBox: {
      alignItems: 'center',
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8,
      minWidth: 50,
  }
});
