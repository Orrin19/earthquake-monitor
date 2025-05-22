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
  coordinates: {
    latitude: number;
    longitude: number;
  };
  magnitude: number;
  depth: number;
  time: string;
  notes?: string;
  starred?: boolean;
  url?: string;
  title?: string;
}

export interface EarthquakeDbModel extends Omit<Earthquake, 'coordinates'> {
  latitude: number;
  longitude: number;
}

export interface USGSFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    detail: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
}

export interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSFeature[];
  bbox: [number, number, number, number, number, number];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
