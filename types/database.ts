export interface Settings {
  id: number;
  min_magnitude: number;
  location: string;
  time: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Earthquake {
  id: string;
  location: string;
  coordinates: Coordinates;
  magnitude: number;
  depth: number;
  time: string;
  notes?: string;
  starred?: boolean;
}

export interface EarthquakeDbModel extends Omit<Earthquake, 'coordinates'> {
  latitude: number;
  longitude: number;
}
