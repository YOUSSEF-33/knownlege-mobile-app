import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_500Medium, Nunito_700Bold, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { Ionicons } from "@expo/vector-icons";
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import axiosInstance from "@/utils/apiServises";
import RenderHtml from 'react-native-render-html';

interface Lesson {
  id: string | number;
  translations: {
    title: { ar: string; en?: string };
    description: { ar: string; en?: string };
  };
}

interface Assignment {
  id: string | number;
  title: string;
  description: string;
  total_marks: number;
  dead_line: string;
}

interface ContentCategory {
  id: string | number;
  translations: {
    title: { ar: string; en?: string };
  };
  lessons: Lesson[];
  assignments: Assignment[];
}

interface Teacher {
  id: string | number;
  first_name: string;
  last_name: string;
  image: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CourseDetailScreen({ id }: any) {
  const { user, loading } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentCategories, setContentCategories] = useState<ContentCategory[]>([]);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>({});
  const [expandedLessons, setExpandedLessons] = useState<string | number | null>(null);
  const [expandedAssignments, setExpandedAssignments] = useState<string | number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axiosInstance.get<{ data: { items: ContentCategory[] } }>(
          `v1/student/courses/${id}/content-categories`
        );
        const categories = response.data.data.items;

        for (const category of categories) {
          const lessonResponse = await axiosInstance.get<{ data: { items: Lesson[] } }>(
            `v1/student/courses/${id}/content-categories/${category.id}/lessons`
          );
          category.lessons = lessonResponse.data.data.items;

          const assignmentResponse = await axiosInstance.get<{ data: { items: Assignment[] } }>(
            `v1/student/courses/${id}/course-content-categories/${category.id}/assignments`
          );
          category.assignments = assignmentResponse.data.data.items;
        }

        const courseResponse = await axiosInstance.get(`v1/student/courses/${id}`);
        const courseData = courseResponse.data.data;
        setCourseDetails(courseData);

        setContentCategories(categories);
        if (categories.length > 0) {
          setActiveCategory(categories[0].id);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleLessonClick = (lessonId: string | number, contentCategoryId: string | number) => {
    router.push({
      pathname: "/(routes)/lesson-content",
      params: { courseId: id, contentCategoryId, lessonId },
    });
  };

  const handleAssignmentClick = (assignmentId: string | number, contentCategoryId: string | number) => {
    router.push({
      pathname: "/(routes)/assignment-content",
      params: { courseId: id, contentCategoryId, assignmentId },
    });
  };

  const handleCategoryClick = (categoryId: string | number) => {
    setActiveCategory(categoryId);
    const index = contentCategories.findIndex(category => category.id === categoryId);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH / 3, animated: true });
    }
  };

  const toggleLessons = (categoryId: string | number) => {
    setExpandedLessons(expandedLessons === categoryId ? null : categoryId);
  };

  const toggleAssignments = (categoryId: string | number) => {
    setExpandedAssignments(expandedAssignments === categoryId ? null : categoryId);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: '#fff' }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: 'black' }]}>Course Details</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCourseInfo = () => (
    <View style={styles.courseInfoContainer}>
      <Text style={styles.courseTitle}>{courseDetails.name}</Text>
      <View style={styles.teachersContainer}>
        {courseDetails.teachers?.map((teacher: Teacher) => (
          <View key={teacher.id} style={styles.teacherItem}>
            <Image source={{ uri: teacher.image || 'https://via.placeholder.com/40' }} style={styles.teacherImage} />
            <Text style={styles.teacherName}>{teacher.first_name} {teacher.last_name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#4CAF50" />
          <Text style={styles.statText}>{courseDetails.credits || '3'} Credits</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={styles.statText}>{courseDetails.code || 'CS101'}</Text>
        </View>
      </View>
      {
        courseDetails.description && (
          <>
            <Text style={styles.courseDescription} numberOfLines={isExpanded ? undefined : 3}>
              {courseDetails.description}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.readMoreText}>{isExpanded ? 'Read Less' : 'Read More'}</Text>
            </TouchableOpacity>
          </>
        )
      }
    </View>
  );

  const renderObjectives = () => {
    if (!courseDetails.translations?.objectives?.length) {
      return null;
    }
  
    return (
      <View style={styles.objectivesContainer}>
        <Text style={styles.sectionTitle}>Objectives</Text>
        <RenderHtml 
          contentWidth={Dimensions.get('window').width} 
          source={{ html: courseDetails.translations.objectives.join('') }} 
        />
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      {contentCategories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categorySlider}
          scrollEventThrottle={16}
          ref={scrollViewRef}
        >
          {contentCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryClick(category.id)}
              style={[styles.categoryTab, activeCategory === category.id && styles.activeCategoryTab]}
            >
              <Text style={[styles.categoryTabText, activeCategory === category.id && styles.activeCategoryTabText]}>
                {category.translations.title.en || category.translations.title.ar}
              </Text>
              {activeCategory === category.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noContentText}>No categories added yet.</Text>
      )}
    </View>
  );

  const renderLessons = () => (
    <View style={styles.lessonsContainer}>
      <TouchableOpacity onPress={() => toggleLessons(activeCategory)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lessons</Text>
        <Ionicons name={expandedLessons === activeCategory ? "chevron-up" : "chevron-down"} size={24} color="black" />
      </TouchableOpacity>
      {expandedLessons === activeCategory && contentCategories.map((category) => {
        if (category.id !== activeCategory) return null;
        return category.lessons.length > 0 ? (
          category.lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => handleLessonClick(lesson.id, category.id)}
              style={styles.lessonItem}
            >
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.translations.title.en || lesson.translations.title.ar}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noContentText}>No lessons available yet.</Text>
        );
      })}
    </View>
  );

  const renderAssignments = () => (
    <View style={styles.lessonsContainer}>
      <TouchableOpacity onPress={() => toggleAssignments(activeCategory)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assignments</Text>
        <Ionicons name={expandedAssignments === activeCategory ? "chevron-up" : "chevron-down"} size={24} color="black" />
      </TouchableOpacity>
      {expandedAssignments === activeCategory && contentCategories.map((category) => {
        if (category.id !== activeCategory) return null;
        return category.assignments?.length > 0 ? (
          category.assignments.map((assignment) => (
            <TouchableOpacity
              key={assignment.id}
              onPress={() => handleAssignmentClick(assignment.id, category.id)}
              style={styles.lessonItem}
            >
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentDeadline}>Deadline: {new Date(assignment.dead_line).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noContentText}>No assignments available yet.</Text>
        );
      })}
    </View>
  );

  return (
    <>
      {loading || fetchingDetails ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => setScrollY(nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: courseDetails.image?.url || 'https://via.placeholder.com/400x200' }}
                style={[
                  styles.courseImage,
                  {
                    transform: [{ translateY: scrollY * 0.5 }],
                    height: SCREEN_HEIGHT * 0.4 + Math.max(0, scrollY * 0.5),
                  }
                ]}
              />
            </View>
            <View style={styles.contentContainer}>
              {renderCourseInfo()}
              {renderObjectives()}
              {renderCategories()}
              {renderLessons()}
              {renderAssignments()}
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#F8F8F8',
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
  imageContainer: {
    height: SCREEN_HEIGHT * 0.4,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  courseInfoContainer: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
    marginBottom: 10,
  },
  teachersContainer: {
    marginBottom: 10,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  teacherImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  teacherName: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: '#333',
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
    fontFamily: "Nunito_500Medium",
    color: '#666',
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Nunito_400Regular",
    marginBottom: 10,
  },
  readMoreText: {
    color: '#3F51B5',
    fontFamily: "Nunito_600SemiBold",
  },
  objectivesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  categoriesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  categorySlider: {
    marginTop: 10,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3F51B5',
  },
  categoryTabText: {
    fontSize: 16,
    color: '#808080',
    fontFamily: "Nunito_600SemiBold",
  },
  activeCategoryTabText: {
    color: '#3F51B5',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3F51B5',
  },
  lessonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
    marginBottom: 4,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderRightWidth: 4,
    borderRightColor: '#007AFF',
    borderBottomWidth: 0.3,
    borderBottomColor: '#888',
    paddingRight: 15,
    paddingVertical: 10,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: '#333',
  },
  lessonDuration: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#666',
  },
  noContentText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#666',
    fontStyle: 'italic',
  },
  assignmentDescription: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#666',
  },
  assignmentDeadline: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#666',
  },
  assignmentMarks: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#666',
  },
});
