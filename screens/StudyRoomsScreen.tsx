import React, { useState } from 'react';
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

const tabs = ['My Rooms', 'Public Rooms', 'Invites'];

const rooms = [
  {
    id: '1',
    name: 'Romans Deep Study',
    description: 'Verse-by-verse study of Paul\'s letter to the Romans',
    participants: 12,
    schedule: 'Tuesdays 7PM',
    tab: 'My Rooms',
  },
  {
    id: '2',
    name: 'Hebrew Beginners',
    description: 'Learn to read the Old Testament in its original language',
    participants: 8,
    schedule: 'Mondays 10AM',
    tab: 'My Rooms',
  },
  {
    id: '3',
    name: 'Psalms Prayer Group',
    description: 'Praying through the Psalms together',
    participants: 25,
    schedule: 'Daily 6AM',
    tab: 'Public Rooms',
  },
  {
    id: '4',
    name: 'Greek New Testament',
    description: 'Advanced study of Koine Greek texts',
    participants: 6,
    schedule: 'Thursdays 8PM',
    tab: 'Public Rooms',
  },
  {
    id: '5',
    name: 'Women\'s Bible Study',
    description: 'You\'ve been invited by Sarah',
    participants: 15,
    schedule: 'Wednesdays 2PM',
    tab: 'Invites',
  },
];

export function StudyRoomsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('My Rooms');
  const { textSize } = useVoice();

  const filteredRooms = rooms.filter((room) => room.tab === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontSize: textSize + 6 }]}>Study Rooms</Text>
          <SpeakerIcon text="Study Rooms. Join or create collaborative Bible study sessions." color="#F5E6D3" />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Room Cards */}
      <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
        {filteredRooms.map((room) => (
          <View key={room.id} style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <Text style={[styles.roomName, { fontSize: textSize }]}>{room.name}</Text>
              <SpeakerIcon text={room.name} size={18} />
            </View>
            <View style={styles.descRow}>
              <Text style={[styles.roomDescription, { fontSize: textSize - 2 }]}>
                {room.description}
              </Text>
              <SpeakerIcon text={room.description} size={14} />
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={16} color="#8B7355" />
                <Text style={styles.infoText}>{room.participants} members</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color="#8B7355" />
                <Text style={styles.infoText}>{room.schedule}</Text>
              </View>
              <SpeakerIcon
                text={`${room.participants} members, meets ${room.schedule}`}
                size={14}
              />
            </View>
            <TouchableOpacity
              style={styles.enterButton}
              onPress={() => navigation.navigate('StudyRoomDetail', { room })}
            >
              <Text style={styles.enterButtonText}>
                {activeTab === 'Invites' ? 'Accept & Join' : 'Enter Room'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Create Room</Text>
      </TouchableOpacity>
    </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD4',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#6B4EFF',
  },
  tabText: {
    fontSize: 14,
    color: '#5C4A3D',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  roomsList: {
    flex: 1,
    padding: 16,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
    flex: 1,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomDescription: {
    color: '#5C4A3D',
    flex: 1,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#8B7355',
  },
  enterButton: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#6B4EFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 180,
  },
});

