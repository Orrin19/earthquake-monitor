import { Coordinates, Settings, USGSFeature } from '../types/database';
import { Earthquake } from '../types/database';

export const fetchEarthquakes = async (
  settings: Settings
): Promise<Earthquake[]> => {
  try {
    // Конвертируем настройки времени в даты
    const endDate = new Date();
    const startDate = new Date();

    switch (settings.time) {
      case '1 час':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '6 часов':
        startDate.setHours(endDate.getHours() - 6);
        break;
      case '12 часов':
        startDate.setHours(endDate.getHours() - 12);
        break;
      case '3 дня':
        startDate.setDate(endDate.getDate() - 3);
        break;
      case '7 дней':
        startDate.setDate(endDate.getDate() - 7);
        break;
      default: // '24 часа'
        startDate.setDate(endDate.getDate() - 1);
    }

    // Форматируем даты для API
    const formatDate = (date: Date) => date.toISOString().split('.')[0] + 'Z';

    const url =
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&starttime=${formatDate(startDate)}` +
      `&endtime=${formatDate(endDate)}` +
      `&minmagnitude=${settings.min_magnitude}` +
      `&limit=200`;

    const response = await fetch(url);
    const data = await response.json();

    return data.features.map((feature: USGSFeature) => ({
      id: feature.id,
      location: feature.properties.place,
      coordinates: {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      },
      magnitude: feature.properties.mag,
      depth: feature.geometry.coordinates[2],
      time: new Date(feature.properties.time).toLocaleString(),
      starred: false,
    }));
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    throw error;
  }
};

export const fetchCoordinates = async (
  location: string
): Promise<Coordinates> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=ru&format=json`
    );
    const data = await response.json();
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw error;
  }
};
