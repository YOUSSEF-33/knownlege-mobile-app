import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "@/components/header/header";
import SearchInput from "@/components/common/search.input";
import HomeBannerSlider from "@/components/home/home.banner.slider";
import AllCourses from "@/components/courses/all.courses";
import { colors } from "@/app/theme";

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={[colors.bg_color, colors.bg_color]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <Header />
      {/* <SearchInput homeScreen={true} /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeBannerSlider />
        <AllCourses />
      </ScrollView>
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({});
