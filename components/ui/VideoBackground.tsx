import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface VideoBackgroundProps {
  videoUri?: string;
  overlayOpacity?: number;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUri = '/dashboard-bg.mp4',
  overlayOpacity = 0,
}) => {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    }
  }, [videoUri]);

  return (
    <View style={styles.container} pointerEvents="none">
      {Platform.OS === 'web' ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 1,
            zIndex: 0,
          }}
          src={videoUri}
        />
      ) : (
        <View style={styles.fallbackBg} />
      )}
      {/* Optional subtle overlay only if explicitly set > 0 */}
      {overlayOpacity > 0 && (
        <View
          style={[
            styles.overlay,
            { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000000',
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  fallbackBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
});
