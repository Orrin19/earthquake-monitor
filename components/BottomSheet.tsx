import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps) {
  const translateY = useSharedValue(300);
  const [height, setHeight] = useState(300);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withSpring(height, { damping: 20 });
    }
  }, [visible, height]);

  const onGestureEvent = (event: { nativeEvent: { translationY: number } }) => {
    if (event.nativeEvent.translationY > 0) {
      translateY.value = event.nativeEvent.translationY;
    }
  };

  const onHandlerStateChange = (event: {
    nativeEvent: { state: number; translationY: number };
  }) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > height / 3) {
        translateY.value = withSpring(height, { damping: 20 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    }
  };

  if (!visible) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[styles.container, animatedStyle]}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
});
