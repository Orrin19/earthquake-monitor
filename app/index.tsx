import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet from '../components/BottomSheet';
import EarthquakeInfo from '../components/EarthquakeInfo';
import { Coordinates, Earthquake } from '../types/database';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  changeFavorite,
} from '../services/database';
import { getSettings } from '../services/database';
import { fetchCoordinates, fetchEarthquakes } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 51.709,
    longitude: 94.453,
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем настройки из БД
        const settings = await getSettings();

        // Загружаем текущее местоположение
        await fetchCoordinates(settings.location)
          .then((location) => {
            setUserLocation(location);
            mapRef.current?.animateToRegion(
              {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 10,
                longitudeDelta: 10,
              },
              1000
            );
          })
          .catch(() => {
            setUserLocation({
              latitude: 51.709,
              longitude: 94.453,
            });
            mapRef.current?.animateToRegion(
              {
                latitude: 51.709,
                longitude: 94.453,
                latitudeDelta: 10,
                longitudeDelta: 10,
              },
              1000
            );
          });

        // Загружаем землетрясения из USGS API
        const usgsQuakes = await fetchEarthquakes(settings);

        // Загружаем избранные из БД
        const favorites = await getFavorites();
        const favoritesMap = new Map(favorites.map((f) => [f.id, f]));

        // Объединяем данные
        const mergedQuakes = usgsQuakes.map((quake) => {
          const favorite = favoritesMap.get(quake.id);
          return favorite
            ? { ...quake, starred: true, notes: favorite.notes }
            : quake;
        });

        setEarthquakes(mergedQuakes);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Не удалось загрузить данные о землетрясениях');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Обновляем данные каждые 5 минут
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkerPress = (quake: Earthquake) => {
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
  };

  const handleSheetClose = () => {
    setSheetVisible(false);
    setSelectedQuake(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Загрузка данных о землетрясениях...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        // initialRegion={{
        //   latitude: userLocation.latitude,
        //   longitude: userLocation.longitude,
        //   latitudeDelta: 10,
        //   longitudeDelta: 10,
        // }}
        onMapReady={() => {
          if (userLocation) {
            mapRef.current?.animateToRegion(
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 10,
                longitudeDelta: 10,
              },
              1000
            );
          }
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
              <Text style={styles.markerText}>
                {quake.magnitude.toFixed(1)}
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  marker: {
    backgroundColor: '#db3434',
    width: 30,
    height: 30,
    borderRadius: 15,
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
