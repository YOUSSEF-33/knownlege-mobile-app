import Loader from "@/components/loader/loader";
import useUser from "@/hooks/auth/useUser";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
import axiosInstance, { fetchUser } from "@/utils/apiServises";

export default function ProfileScreen() {

  //const [user, setUser] = useState<User | undefined>()
  const {user, loading} = useUser()
  const [image, setImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [token, setToken] = useState("");

  /* const getUser = async()=>{
    const userData:User | undefined = await fetchUser(token)
    setUser(userData)
    console.log(userData);
    if(userData){
      setLoading(false)
    }
  } */
  
// useEffect(()=>{
   /*  const getUserData = async () => {
      const userData = fetchUser(token);
      if (userData) {
        setUser(await userData);
      } else {
        console.log('Failed to fetch user data');
      }
      setLoading(false);
    };

    getUserData(); */
 
  //getUser()
/*   getToken()
 },[])

 
 const getToken = async ()=>{
  const thisToken:any = await AsyncStorage.getItem("access_token");
  setToken(thisToken)
  console.log(thisToken)
 } */

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const logoutHandler = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    router.push("/(routes)/login");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLoader(true);
      const base64Image = `data:image/jpeg;base64,${base64}`;
      setImage(base64Image);

      const accessToken:any = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      try {
        const response = await axios.put(
          `${SERVER_URI}/update-user-avatar`,
          {
            avatar: base64Image,
          },
          {
            headers: {
              "access-token": accessToken,
              "refresh-token": refreshToken,
            },
          }
        );
        if (response.data) {
        }
      } catch (error) {
      }
    }
  };

  return (
    <>
      {loader || loading ? (
        <Loader />
      ) : (
        <LinearGradient
          colors={["#E5ECF9", "#F6F7F9"]}
          style={{ flex: 1, paddingTop: 80 }}
        >
          <ScrollView>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{
                    uri:
                      image ||
                      user?.profile_image?.url ||
                      "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
                  }}
                  style={{ width: 90, height: 90, borderRadius: 100 }}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 0,
                    width: 30,
                    height: 30,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 100,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={pickImage}
                >
                  <Ionicons name="camera-outline" size={25} />
                </TouchableOpacity>
              </View>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontSize: 25,
                paddingTop: 10,
                fontWeight: "600",
              }}
            >
              {user?.first_name + " " + user?.last_name}
            </Text>
            <View style={{ marginHorizontal: 16, marginTop: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 16,
                  fontFamily: "Raleway_700Bold",
                }}
              >
                Account Details
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
                onPress={() => router.push("/(routes)/profile-details")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                    }}
                  >
                    <FontAwesome
                      style={{ alignSelf: "center" }}
                      name="user-o"
                      size={20}
                      color={"black"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Detail Profile
                    </Text>
                    <Text
                      style={{
                        color: "#575757",
                        fontFamily: "Nunito_400Regular",
                      }}
                    >
                      Information Account
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#CBD5E0"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
                onPress={() => router.push("/(routes)/enrolled-courses")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="book-account-outline"
                      size={20}
                      color={"black"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Enrolled courses
                    </Text>
                    <Text
                      style={{
                        color: "#575757",
                        fontFamily: "Nunito_400Regular",
                      }}
                    >
                      The all enrolled courses
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#CBD5E0"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
                onPress={() => logoutHandler()}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                    }}
                  >
                    <Ionicons
                      style={{ alignSelf: "center" }}
                      name="log-out-outline"
                      size={20}
                      color={"black"}
                    />
                  </View>
                  <TouchableOpacity onPress={() => logoutHandler()}>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Log Out
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#CBD5E0"} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
}
