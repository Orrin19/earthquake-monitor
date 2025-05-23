import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState, useEffect } from 'react';
import {
  getFavorites,
  getSettings,
  updateSettings,
} from '../services/database';
import { fetchEarthquakes } from '@/services/api';

export default function MenuScreen() {
  const [location, setLocation] = useState('Красноярск');
  const [magnitude, setMagnitude] = useState(3);
  const [selectedTime, setSelectedTime] = useState('24 часа');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const timeOptions = [
    '1 час',
    '6 часов',
    '12 часов',
    '24 часа',
    '3 дня',
    '7 дней',
  ];

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const settings = await getSettings();
      const quakes = await fetchEarthquakes(settings);
      const favorites = await getFavorites();
      const updatedQuakes = quakes.map((q) => {
        const fav = favorites.find((f) => f.id === q.id);
        return fav ? { ...q, starred: true, notes: fav.notes } : q;
      });
      fetchEarthquakes(settings);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Загрузка настроек из базы данных
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setMagnitude(settings.min_magnitude);
        setLocation(settings.location);
        setSelectedTime(settings.time);
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Автосохранение при изменении настроек
  useEffect(() => {
    if (!loading) {
      const saveSettings = async () => {
        try {
          await updateSettings({
            location: location,
            min_magnitude: magnitude,
            time: selectedTime,
          });
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      };

      const timer = setTimeout(() => {
        saveSettings();
      }, 500); // Дебаунс 500 мс

      return () => clearTimeout(timer);
    }
  }, [magnitude, location, selectedTime, loading]);

  const handleTimeSelect = (option: string) => {
    setSelectedTime(option);
    setShowTimeDropdown(false);
    // Можно добавить сохранение этого параметра в БД
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка настроек...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Недавние землетрясения</Text>

        <View style={styles.earthquakeItem}>
          <Ionicons name="location" size={16} color="#FF3B30" />
          <Text style={styles.earthquakeText}>120 км восточнее г. Кызыл</Text>
          <Text style={styles.magnitude}>5.5</Text>
        </View>

        <View style={styles.earthquakeItem}>
          <Ionicons name="location" size={16} color="#FF9500" />
          <Text style={styles.earthquakeText}>70 км юго-западнее г. Кызыл</Text>
          <Text style={styles.magnitude}>3.1</Text>
        </View>
      </View> */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Ваше местоположение</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Введите город"
            />
            {location.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setLocation('')}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.settingLabel}>
          Показывать землетрясения магнитудой не менее: {magnitude.toFixed(1)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={0.1}
          value={magnitude}
          onSlidingComplete={(value) => setMagnitude(value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#D1D1D6"
          thumbTintColor="#007AFF"
        />

        <View style={styles.divider} />

        <Text style={styles.settingLabel}>
          Показывать землетрясения за последние
        </Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowTimeDropdown(!showTimeDropdown)}
        >
          <Text style={styles.dropdownButtonText}>{selectedTime}</Text>
          <Ionicons
            name={showTimeDropdown ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#8E8E93"
          />
        </TouchableOpacity>

        {showTimeDropdown && (
          <View style={styles.dropdown}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => handleTimeSelect(option)}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedTime === option &&
                      styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  earthquakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  earthquakeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  magnitude: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1C1C1E',
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1C1C1E',
  },
  clearButton: {
    padding: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dropdownOption: {
    padding: 12,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  dropdownOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
