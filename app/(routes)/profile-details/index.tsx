import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CourseCard from '@/components/cards/course.card';
import Loader from '@/components/loader/loader';
import useUser from '@/hooks/auth/useUser';

const index = () => {
  const { loading, user } = useUser();

  if (loading) {
    return <Loader />;
  }

  return (
    <LinearGradient colors={['#E5ECF9', '#F6F7F9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.profile_image?.url || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{`${user?.first_name} ${user?.last_name}`}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.detailTitle}>Phone:</Text>
          <Text style={styles.detailText}>{user?.phone}</Text>
          <Text style={styles.detailTitle}>Address:</Text>
          <Text style={styles.detailText}>{user?.address}</Text>
          <Text style={styles.detailTitle}>National ID:</Text>
          <Text style={styles.detailText}>{user?.national_id}</Text>
          <Text style={styles.detailTitle}>GPA:</Text>
          <Text style={styles.detailText}>{user?.gpa}</Text>
          <Text style={styles.detailTitle}>Year:</Text>
          <Text style={styles.detailText}>{user?.year}</Text>
          <Text style={styles.detailTitle}>Faculty:</Text>
          <Text style={styles.detailText}>{user?.faculty.name}</Text>
          <Text style={styles.detailTitle}>Department:</Text>
          <Text style={styles.detailText}>{user?.department.name}</Text>
          <Text style={styles.detailTitle}>Group:</Text>
          <Text style={styles.detailText}>{user?.group.name}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    color: 'gray',
  },
  profileDetails: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    color: 'gray',
  },
  coursesContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  coursesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default index;
