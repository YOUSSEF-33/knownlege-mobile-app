import axiosInstance from '@/utils/apiServises';
import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity, // Import TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

const { width } = Dimensions.get('window');

const SPACING = 2;
const ITEM_LENGTH = width * 0.8;
const ITEM_HEIGHT = ITEM_LENGTH * 0.6; // Adjust this for the aspect ratio
const BORDER_RADIUS = 20;

interface GalleryItem {
  id: number;
  name: string;
  url: string;
  disk: string;
}

interface BannerDataTypes {
  id: number;
  title: string;
  content: string;
  gallery: GalleryItem[];
  is_read: number;
}

const ImageCarousel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<BannerDataTypes[]>([]);
  const scrollX: any = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axiosInstance.get('v1/student/announcements');
        setAnnouncements(response.data.data.items);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();

    // Start the auto-scroll timer
    startAutoScroll();

    return () => {
      // Clear the interval when the component is unmounted
      stopAutoScroll();
    };
  }, []);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }: any) => {
      const maxOffset = (announcements.length - 1) * (ITEM_LENGTH + SPACING * 2);

      if (value >= maxOffset) {
        if (resetTimeout.current) {
          clearTimeout(resetTimeout.current);
        }
        resetTimeout.current = setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }, 3000); // Wait for 3 seconds before resetting
      }
    });

    return () => {
      scrollX.removeListener(listener);
    };
  }, [announcements, scrollX]);

  const startAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }

    scrollInterval.current = setInterval(() => {
      flatListRef.current?.scrollToOffset({
        offset: scrollX._value + ITEM_LENGTH + SPACING * 2,
        animated: true,
      });
    }, 3000); // Adjust the interval as needed
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const handlePress = (announcementId: number) => {
    router.push(`/(routes)/announcement/${announcementId}`);
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={announcements}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (ITEM_LENGTH + SPACING * 2),
            index * (ITEM_LENGTH + SPACING * 2),
            (index + 1) * (ITEM_LENGTH + SPACING * 2),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity onPress={() => handlePress(item.id)}>
              <Animated.View
                style={{
                  width: ITEM_LENGTH,
                  transform: [{ scale }],
                }}
              >
                <View style={styles.itemContent}>
                  <Image source={{ uri: item.gallery[0].url }} style={styles.itemImage} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_LENGTH + SPACING * 2}
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{
          paddingHorizontal: (width - ITEM_LENGTH) / 2, // Centering the items
        }}
        ItemSeparatorComponent={() => <View style={{ width: SPACING * 2 }} />}
      />

      <View style={styles.pagination}>
        {announcements.map((_, index) => {
          const inputRange = [
            (index - 1) * (ITEM_LENGTH + SPACING * 2),
            index * (ITEM_LENGTH + SPACING * 2),
            (index + 1) * (ITEM_LENGTH + SPACING * 2),
          ];

          const dotSize = scrollX.interpolate({
            inputRange,
            outputRange: [6, 10, 6],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  itemContent: {
    marginHorizontal: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS + SPACING * 2,
  },
  itemImage: {
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: BORDER_RADIUS,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Ensure dots are below the slides
  },
  dot: {
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
  },
});

export default ImageCarousel;
