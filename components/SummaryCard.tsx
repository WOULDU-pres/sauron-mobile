import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  color: string;
}

const SummaryCard = ({ icon: Icon, title, count, color }: SummaryCardProps) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="white" />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    flex: 1,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    marginTop: 8,
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  count: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SummaryCard; 