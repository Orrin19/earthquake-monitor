import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

interface EarthquakeInfoProps {
  earthquake: {
    location: string;
    coordinates: { latitude: number; longitude: number };
    magnitude: number;
    depth: number;
    time: string;
    starred: boolean;
    notes?: string;
  };
}

export default function EarthquakeInfo({ earthquake }: EarthquakeInfoProps) {
  const setNotes = (text: string) => {
    earthquake.notes = text;
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.star}
        onPress={() => {
          earthquake.starred = !earthquake.starred;
        }}
      >
        <Ionicons
          name={earthquake.starred ? 'star' : 'star-outline'}
          size={24}
          color="black"
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

      <Text style={styles.label}>Примечание</Text>
      <TextInput
        style={styles.notesInput}
        multiline
        numberOfLines={4}
        placeholder="Добавьте свои наблюдения..."
        value={earthquake.notes}
        onChangeText={setNotes}
      />
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
});
