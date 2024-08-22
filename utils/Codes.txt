import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { useFonts, Raleway_700Bold, Raleway_600SemiBold } from "@expo-google-fonts/raleway";
import { Nunito_600SemiBold, Nunito_500Medium } from "@expo-google-fonts/nunito";
import axiosInstance from "@/utils/apiServises";
import { router } from "expo-router";
import { colors } from "@/app/theme";

type CourseType = {
  id: number;
  name: string;
  code: string;
  start_year: number;
  hours: number;
  image: {
    id: number;
    name: string;
    url: string;
    disk: string;
  } | null;
  translations: {
    name: {
      ar: string;
      en?: string;
    };
    objectives: string[];
  };
  created_at: string;
};

const CourseCard: React.FC<{ course: CourseType }> = ({ course }) => (
  <TouchableOpacity onPress={() => router.push(`/(routes)/course-details/${course.id}`)}>
    <View style={styles.card}>
      <Image
        source={{ uri: course.image ? course.image.url : 'https://via.placeholder.com/150' }}
        style={styles.thumbnail}
      />
      <Text style={styles.title}>{course.translations.name.en || course.translations.name.ar}</Text>
      <Text style={styles.lectures}>Code: {course.code}</Text>
      <Text style={styles.lectures}>Hours: {course.hours}</Text>
    </View>
  </TouchableOpacity>
);

const AllCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList<CourseType>>(null);
  const scrollOffset = useRef(0);
  const viewableItems = useRef([]);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
    Nunito_500Medium,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("v1/student/courses?limit=4&page=1");
        setCourses(response.data.data.items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current && courses.length > 0) {
        const newOffset = scrollOffset.current + 260; // Adjust this value as needed
        if (newOffset > (courses.length - 1) * 260) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          scrollOffset.current = 0;
        } else {
          flatListRef.current.scrollToOffset({ offset: newOffset, animated: true });
          scrollOffset.current = newOffset;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [courses]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
        <Text style={styles.headerLink} onPress={()=>{
          router.push(`/(tabs)/courses`)
        }}>See all</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CourseCard course={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.x;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Raleway_700Bold',
  },
  headerLink:{
    paddingHorizontal:8,
    fontSize:18,
    color:"#007AFF",
  },
  flatListContent: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  card: {
    backgroundColor: colors.bg_color,
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
    width: 250, // Adjusted card width
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    marginVertical: 8,
  },
  lectures: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'gray',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: 'gray',
  },
});

export default AllCourses;
