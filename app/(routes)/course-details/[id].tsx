import CourseDetailScreen from "@/screens/home/course/course.details.screen";
import { useLocalSearchParams } from "expo-router";

export default function index() {
  const { id }:any = useLocalSearchParams<{ id: string }>();
  return (
   <CourseDetailScreen id={id} />
  )
}