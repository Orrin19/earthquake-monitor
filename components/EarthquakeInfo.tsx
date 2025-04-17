import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

interface EarthquakeInfoProps {
  earthquake: {
    id: string;
    location: string;
    coordinates: { latitude: number; longitude: number };
    magnitude: number;
    depth: number;
    time: string;
    starred?: boolean;
    notes?: string;
  };
  onStarToggle: (starred: boolean, notes?: string) => Promise<void>;
  onNotesChange: (notes: string) => Promise<void>;
}

export default function EarthquakeInfo({
  earthquake,
  onStarToggle,
  onNotesChange,
}: EarthquakeInfoProps) {
  const [notes, setNotes] = useState(earthquake.notes || '');
  const [isStarred, setIsStarred] = useState(earthquake.starred || false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNotes(earthquake.notes || '');
    setIsStarred(earthquake.starred || false);
  }, [earthquake]);

  const handleStarToggle = async () => {
    setIsLoading(true);
    try {
      const newStarredState = !isStarred;
      await onStarToggle(newStarredState, notes);
      setIsStarred(newStarredState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotesChange = async (text: string) => {
    setNotes(text);
    if (isStarred) {
      try {
        await onNotesChange(text);
      } catch (error) {
        console.error('Error updating notes:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.star}
        onPress={handleStarToggle}
        disabled={isLoading}
      >
        <Ionicons
          name={isStarred ? 'star' : 'star-outline'}
          size={24}
          color={isStarred ? 'gold' : 'gray'}
        />
      </TouchableOpacity>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Местоположение</Text>
        <Text style={styles.value}>{earthquake.location}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Координаты</Text>
        <Text style={styles.value}>
          {earthquake.coordinates.latitude.toFixed(6)}° с.ш.{'\n'}
          {earthquake.coordinates.longitude.toFixed(6)}° в.д.
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Магнитуда</Text>
        <Text style={styles.value}>{earthquake.magnitude}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Глубина</Text>
        <Text style={styles.value}>{earthquake.depth} км</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Время</Text>
        <Text style={styles.value}>{earthquake.time}</Text>
      </View>

      {isStarred && (
        <>
          <Text style={styles.label}>Примечание</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Добавьте свои наблюдения..."
            value={notes}
            onChangeText={handleNotesChange}
            editable={isStarred}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  star: {
    position: 'absolute',
    top: -10,
    right: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: '40%',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
  },
  notes: {
    fontStyle: 'italic',
    color: '#999',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  favoriteMarker: {
    borderColor: 'gold',
    borderWidth: 2,
  },
  starBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 2,
  },
});
