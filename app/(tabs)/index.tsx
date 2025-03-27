import { View, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="/explore" style={styles.settingsButton}>
          <Ionicons name="settings" size={24} color="black" />
        </Link>
      </View>

      <MapView style={styles.map} />

      <View style={styles.bottomSheet}>{/* Контент выдвижной панели */}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  map: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    height: 300,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});
