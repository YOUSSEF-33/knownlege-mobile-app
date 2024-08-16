import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function CourseCard({ item }: { item: any }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`/(routes)/course-details/${item.id}`)
      }
    >
      <Image
        style={styles.thumbnail}
        source={{ uri: item.image ? item.image.url : 'https://via.placeholder.com/150x100' }}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.translations.name.en || item.translations.name.ar}
        </Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.details}>{item.hours} hours • {item.code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    width: wp('44%'), // Slightly less than 50% to account for gap
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: hp('12%'),
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('3.5%'),
    fontFamily: 'Nunito_700Bold',
    marginBottom: hp('0.5%'),
    color: '#1c1d1f',
  },
  detailsContainer: {
    marginTop: hp('0.5%'),
  },
  details: {
    fontSize: wp('3%'),
    fontFamily: 'Nunito_500Medium',
    color: '#6a6f73',
  },
});