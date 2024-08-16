import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { Ionicons } from "@expo/vector-icons";
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import axiosInstance from "@/utils/apiServises";
import RenderHtml from 'react-native-render-html';

interface AnnouncementImage {
  id: number;
  name: string;
  url: string;
  disk: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  sent_users_count: number | null;
  read_count: number;
  gallery: AnnouncementImage[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, loading } = useUser();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        const response = await axiosInstance.get(`v1/student/announcements/${id}`);
        setAnnouncement(response.data.data);
      } catch (error) {
        console.error("Error fetching announcement details:", error);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchAnnouncementDetails();
  }, [id]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Announcement Details</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentImageIndex(slideIndex);
        }}
      >
        {announcement?.gallery.map((image, index) => (
          <Image
            key={image.id}
            source={{ uri: image.url }}
            style={styles.galleryImage}
          />
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        {announcement?.gallery.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === currentImageIndex ? '#007AFF' : '#D1D1D6' }
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderAnnouncementContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.announcementTitle}>{announcement?.title}</Text>
      {/* <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color="#4CAF50" />
          <Text style={styles.statText}>{announcement?.read_count} Views</Text>
        </View>
        {announcement?.sent_users_count && (
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#FFC107" />
            <Text style={styles.statText}>{announcement.sent_users_count} Recipients</Text>
          </View>
        )}
      </View> */}
      <RenderHtml
        contentWidth={SCREEN_WIDTH - 32}
        source={{ html: announcement?.content || '' }}
      />
    </View>
  );

  return (
    <>
      {loading || fetchingDetails ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderImageGallery()}
            {renderAnnouncementContent()}
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
  },
  placeholder: {
    width: 40,
  },
  imageGalleryContainer: {
    height: SCREEN_HEIGHT * 0.4,
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    resizeMode: 'cover',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop:-25,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 16,
  },
  announcementTitle: {
    fontSize:24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: '#666',
  },
});