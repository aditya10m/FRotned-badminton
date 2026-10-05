import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

// 55 frames loaded from assets
export const FRAME_ASSETS = [
  require('../../assets/frames/ezgif-frame-001.jpg'),
  require('../../assets/frames/ezgif-frame-002.jpg'),
  require('../../assets/frames/ezgif-frame-003.jpg'),
  require('../../assets/frames/ezgif-frame-004.jpg'),
  require('../../assets/frames/ezgif-frame-005.jpg'),
  require('../../assets/frames/ezgif-frame-006.jpg'),
  require('../../assets/frames/ezgif-frame-007.jpg'),
  require('../../assets/frames/ezgif-frame-008.jpg'),
  require('../../assets/frames/ezgif-frame-009.jpg'),
  require('../../assets/frames/ezgif-frame-010.jpg'),
  require('../../assets/frames/ezgif-frame-011.jpg'),
  require('../../assets/frames/ezgif-frame-012.jpg'),
  require('../../assets/frames/ezgif-frame-013.jpg'),
  require('../../assets/frames/ezgif-frame-014.jpg'),
  require('../../assets/frames/ezgif-frame-015.jpg'),
  require('../../assets/frames/ezgif-frame-016.jpg'),
  require('../../assets/frames/ezgif-frame-017.jpg'),
  require('../../assets/frames/ezgif-frame-018.jpg'),
  require('../../assets/frames/ezgif-frame-019.jpg'),
  require('../../assets/frames/ezgif-frame-020.jpg'),
  require('../../assets/frames/ezgif-frame-021.jpg'),
  require('../../assets/frames/ezgif-frame-022.jpg'),
  require('../../assets/frames/ezgif-frame-023.jpg'),
  require('../../assets/frames/ezgif-frame-024.jpg'),
  require('../../assets/frames/ezgif-frame-025.jpg'),
  require('../../assets/frames/ezgif-frame-026.jpg'),
  require('../../assets/frames/ezgif-frame-027.jpg'),
  require('../../assets/frames/ezgif-frame-028.jpg'),
  require('../../assets/frames/ezgif-frame-029.jpg'),
  require('../../assets/frames/ezgif-frame-030.jpg'),
  require('../../assets/frames/ezgif-frame-031.jpg'),
  require('../../assets/frames/ezgif-frame-032.jpg'),
  require('../../assets/frames/ezgif-frame-033.jpg'),
  require('../../assets/frames/ezgif-frame-034.jpg'),
  require('../../assets/frames/ezgif-frame-035.jpg'),
  require('../../assets/frames/ezgif-frame-036.jpg'),
  require('../../assets/frames/ezgif-frame-037.jpg'),
  require('../../assets/frames/ezgif-frame-038.jpg'),
  require('../../assets/frames/ezgif-frame-039.jpg'),
  require('../../assets/frames/ezgif-frame-040.jpg'),
  require('../../assets/frames/ezgif-frame-041.jpg'),
  require('../../assets/frames/ezgif-frame-042.jpg'),
  require('../../assets/frames/ezgif-frame-043.jpg'),
  require('../../assets/frames/ezgif-frame-044.jpg'),
  require('../../assets/frames/ezgif-frame-045.jpg'),
  require('../../assets/frames/ezgif-frame-046.jpg'),
  require('../../assets/frames/ezgif-frame-047.jpg'),
  require('../../assets/frames/ezgif-frame-048.jpg'),
  require('../../assets/frames/ezgif-frame-049.jpg'),
  require('../../assets/frames/ezgif-frame-050.jpg'),
  require('../../assets/frames/ezgif-frame-051.jpg'),
  require('../../assets/frames/ezgif-frame-052.jpg'),
  require('../../assets/frames/ezgif-frame-053.jpg'),
  require('../../assets/frames/ezgif-frame-054.jpg'),
  require('../../assets/frames/ezgif-frame-055.jpg'),
];

interface ScrollFrameAnimationProps {
  currentFrameIndex: number;
  opacity?: number;
}

export const ScrollFrameBackground: React.FC<ScrollFrameAnimationProps> = ({
  currentFrameIndex,
  opacity = 0.95,
}) => {
  const safeIndex = Math.max(0, Math.min(FRAME_ASSETS.length - 1, currentFrameIndex));
  const activeFrame = FRAME_ASSETS[safeIndex];

  return (
    <View style={styles.backgroundContainer} pointerEvents="none">
      {activeFrame ? (
        <Image
          source={activeFrame}
          style={[styles.frameImage, { opacity }]}
          contentFit="cover"
          transition={0}
          cachePolicy="memory"
        />
      ) : (
        <View style={[styles.frameImage, { backgroundColor: '#111827', opacity }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    height: windowHeight,
    width: windowWidth,
    zIndex: -1,
    overflow: 'hidden',
    backgroundColor: '#050505',
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
});
