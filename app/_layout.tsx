import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CenterTitle = ({ title }: { title: string }) => (
  <View style={styles.titleContainer}>
    <Text style={styles.titleText}>{title}</Text>
  </View>
);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerLeft: ({ canGoBack }) => (
            <View style={styles.headerButtonContainer}>
              {canGoBack ? (
                <Link href=".." style={styles.headerButton}>
                  <Ionicons name="arrow-back" size={24} color="black" />
                </Link>
              ) : (
                <Link href="/menu" style={styles.headerButton}>
                  <Ionicons name="menu" size={24} color="black" />
                </Link>
              )}
            </View>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => <CenterTitle title="Монитор землетрясений" />,
          }}
        />
        <Stack.Screen
          name="menu"
          options={{
            headerTitle: () => <CenterTitle title="Меню" />,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtonContainer: {
    marginLeft: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 12,
  },
});
