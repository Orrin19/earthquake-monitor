import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Settings, Earthquake, EarthquakeDbModel } from '../types/database';

const DB_NAME = 'earthquakes.db';

const db: SQLiteDatabase = openDatabaseSync(DB_NAME);

export const initDatabase = async (): Promise<void> => {
  try {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          min_magnitude REAL DEFAULT 3,
          location TEXT DEFAULT 'Красноярск',
          time TEXT DEFAULT '24 часа'
        );
        
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          location TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          magnitude REAL NOT NULL,
          depth INTEGER NOT NULL,
          time TEXT NOT NULL,
          notes TEXT
        );
        
        INSERT OR IGNORE INTO settings (id) VALUES (1);`
    );
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const result = db.getAllSync<Settings>(
      'SELECT * FROM settings WHERE id = 1;'
    );

    if (result.length === 0) {
      throw new Error('Settings not found');
    }

    return {
      ...result[0],
      time: result[0].time,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

export const updateSettings = async (
  settings: Partial<Settings>
): Promise<void> => {
  try {
    db.runSync(
      `UPDATE settings SET
        min_magnitude = COALESCE(?, min_magnitude),
        location = COALESCE(?, location),
        time = COALESCE(?, time)
      WHERE id = 1;`,
      [
        settings.min_magnitude ?? null,
        settings.location ?? null,
        settings.time ?? null,
      ]
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<Earthquake[]> => {
  try {
    const result = db.getAllSync<EarthquakeDbModel>('SELECT * FROM favorites;');
    return result.map((item) => ({
      id: item.id,
      location: item.location,
      coordinates: {
        latitude: item.latitude,
        longitude: item.longitude,
      },
      magnitude: item.magnitude,
      depth: item.depth,
      time: item.time,
      notes: item.notes,
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const addFavorite = async (earthquake: Earthquake): Promise<void> => {
  try {
    db.runSync(
      `INSERT OR REPLACE INTO favorites 
      (id, location, latitude, longitude, magnitude, depth, time, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        earthquake.id,
        earthquake.location,
        earthquake.coordinates.latitude,
        earthquake.coordinates.longitude,
        earthquake.magnitude,
        earthquake.depth,
        earthquake.time,
        earthquake.notes || null,
      ]
    );
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const changeFavorite = async (
  id: string,
  notes: string
): Promise<void> => {
  try {
    db.runSync(`UPDATE favorites SET notes = ? WHERE id = ?;`, [notes, id]);
  } catch (error) {
    console.error('Error changing favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (id: string): Promise<void> => {
  try {
    db.runSync('DELETE FROM favorites WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};
