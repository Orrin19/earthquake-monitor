import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Link href=".." style={{ alignSelf: 'flex-end' }}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </Link>

      <Text>Экран настроек</Text>
    </View>
  );
}
