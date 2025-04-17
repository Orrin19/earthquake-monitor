import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet from '../components/BottomSheet';
import EarthquakeInfo from '../components/EarthquakeInfo';
import { Earthquake } from '../types/database';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  changeFavorite,
} from '../services/database';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const initialQuakes: Earthquake[] = [
          {
            id: '1',
            location: '120 км восточнее г. Кызыл',
            coordinates: { latitude: 51.709, longitude: 94.453 },
            magnitude: 5.5,
            depth: 50,
            time: '27.02.2025 03:57:10 (Asia/Krasnoyarsk)',
            starred: false,
          },
          {
            id: '2',
            location: '70 км юго-западнее г. Кызыл',
            coordinates: { latitude: 51.209, longitude: 93.953 },
            magnitude: 3.1,
            depth: 30,
            time: '27.02.2025 05:23:45 (Asia/Krasnoyarsk)',
            starred: false,
          },
        ];

        const favorites = await getFavorites();
        const updatedFavorites = favorites.map((f) => ({
          ...f,
          starred: true,
        }));
        const favouritesIds = updatedFavorites.map((f) => f.id);
        const updatedQuakes = initialQuakes
          .filter((quake) => !favouritesIds.includes(quake.id))
          .concat(updatedFavorites);
        setEarthquakes(updatedQuakes);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleMarkerPress = (quake: Earthquake) => {
    if (selectedQuake?.id !== quake.id) {
      setSelectedQuake(quake);
      setSheetVisible(true);

      mapRef.current?.animateToRegion(
        {
          ...quake.coordinates,
          latitudeDelta: 2,
          longitudeDelta: 2,
        },
        500
      );

      setTimeout(() => {
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: quake.coordinates.latitude - 0.5,
              longitude: quake.coordinates.longitude,
            },
            pitch: 0,
            heading: 0,
            altitude: 1000,
            zoom: 6,
          },
          { duration: 300 }
        );
      }, 100);
    }
  };

  const handleSheetClose = () => {
    setSheetVisible(false);
    setSelectedQuake(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 51.709,
          longitude: 94.453,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
      >
        {earthquakes.map((quake) => (
          <Marker
            key={quake.id}
            coordinate={quake.coordinates}
            onPress={() => handleMarkerPress(quake)}
          >
            <View
              style={[
                styles.marker,
                quake.starred && styles.favoriteMarker,
                selectedQuake?.id === quake.id && styles.selectedMarker,
              ]}
            >
              <Text style={styles.markerText}>{quake.magnitude}</Text>
              {quake.starred && (
                <View style={styles.starBadge}>
                  <Ionicons name="star" size={8} color="gold" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {sheetVisible && selectedQuake && (
        <BottomSheet visible={sheetVisible} onClose={handleSheetClose}>
          <EarthquakeInfo
            earthquake={selectedQuake}
            onStarToggle={async (starred, notes) => {
              if (starred) {
                await addFavorite(selectedQuake);
              } else {
                await removeFavorite(selectedQuake.id);
              }
              setEarthquakes((prev) =>
                prev.map((q) =>
                  q.id === selectedQuake.id ? { ...q, starred, notes } : q
                )
              );
              setSelectedQuake((prev) =>
                prev ? { ...prev, starred, notes } : null
              );
            }}
            onNotesChange={async (notes) => {
              if (selectedQuake?.starred) {
                await changeFavorite(selectedQuake.id, notes);
                setSelectedQuake((prev) => (prev ? { ...prev, notes } : null));
              }
            }}
          />
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    backgroundColor: '#db3434',
    width: 30,
    height: 30,
    borderRadius: '50%',
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    aspectRatio: 1,
    overflow: 'visible',
  },
  selectedMarker: {
    backgroundColor: '#f39c12',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
  favoriteMarker: {
    borderColor: 'gold',
    borderWidth: 2,
  },
  starBadge: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 2,
  },
});
