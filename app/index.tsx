import { useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet from '../components/BottomSheet';
import EarthquakeInfo from '../components/EarthquakeInfo';

interface Earthquake {
  id: string;
  location: string;
  coordinates: { latitude: number; longitude: number };
  magnitude: number;
  depth: number;
  time: string;
  starred: boolean;
  notes?: string;
}

export default function HomeScreen() {
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const earthquakes: Earthquake[] = [
    {
      id: '1',
      location: '120 км восточнее г. Кызыл',
      coordinates: { latitude: 51.709, longitude: 94.453 },
      magnitude: 5.5,
      depth: 50,
      time: '27.02.2025 03:57:10 (Asia/Krasnoyarsk)',
      starred: true,
      notes: 'Сильное землетрясение',
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
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.marker,
                selectedQuake?.id === quake.id && styles.selectedMarker,
              ]}
            >
              <Text style={styles.markerText}>{quake.magnitude}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {sheetVisible && selectedQuake && (
        <BottomSheet visible={sheetVisible} onClose={handleSheetClose}>
          <EarthquakeInfo earthquake={selectedQuake} />
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
});
