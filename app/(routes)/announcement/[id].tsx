import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);
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

  useEffect(() => {
    if (announcement?.gallery && announcement.gallery.length > 0) {
      Image.getSize(announcement.gallery[0].url, (width, height) => {
        const aspectRatio = width / height;
        setImageDimensions({
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH / aspectRatio,
        });
      }, (error) => {
        console.error("Error getting image size:", error);
      });
    }
  }, [announcement]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
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
            style={[styles.galleryImage, imageDimensions]}
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
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    resizeMode: 'contain',
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
    marginTop: -25,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 16,
  },
  announcementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
    marginBottom: 10,
  },
});
