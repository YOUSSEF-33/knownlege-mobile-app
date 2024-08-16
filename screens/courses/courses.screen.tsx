import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TextInput } from "react-native";
import { useFonts, Raleway_700Bold, Raleway_600SemiBold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold, Nunito_500Medium, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { AntDesign } from '@expo/vector-icons';
import Loader from "@/components/loader/loader";
import CourseCard from "@/components/cards/course.card";
import axiosInstance from "@/utils/apiServises";

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    axiosInstance
      .get(`v1/student/courses`)
      .then((res) => {
        setCourses(res.data.data.items);
        setFilteredCourses(res.data.data.items);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = courses.filter((course:any) =>
        course.translations.name.en?.toLowerCase().includes(text.toLowerCase()) ||
        course.translations.name.ar?.toLowerCase().includes(text.toLowerCase()) ||
        course.code.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  };

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderCourseRow = (course1: any, course2: any) => (
    <View style={styles.courseRow} key={course1.id}>
      <CourseCard item={course1} />
      {course2 && <CourseCard item={course2} />}
    </View>
  );

  const renderCourseList = () => {
    const rows = [];
    for (let i = 0; i < filteredCourses.length; i += 2) {
      rows.push(renderCourseRow(filteredCourses[i], filteredCourses[i + 1]));
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
      </View>
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#6a6f73" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses"
          placeholderTextColor="#6a6f73"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView style={styles.contentContainer}>
        {loading ? (
          <Loader />
        ) : filteredCourses.length > 0 ? (
          renderCourseList()
        ) : (
          <Text style={styles.emptyText}>No courses available!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 30,
    paddingVertical: 10,
  },
  header: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#d1d7dc',
  },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontFamily: 'Raleway_700Bold',
    color: '#1c1d1f',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#d1d7dc',
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Nunito_500Medium',
    fontSize: wp('4%'),
    color: '#1c1d1f',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp('3%'),
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  emptyText: {
    textAlign: "center",
    fontSize: wp('4%'),
    fontFamily: 'Nunito_500Medium',
    color: '#6a6f73',
    marginTop: hp('10%'),
  },
});
