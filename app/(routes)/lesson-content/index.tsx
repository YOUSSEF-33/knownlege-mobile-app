import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Linking, Image, StyleSheet, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_500Medium, Nunito_700Bold, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import axiosInstance from "@/utils/apiServises";
import Loader from "@/components/loader/loader";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from 'expo-intent-launcher';
import WebView from "react-native-webview";
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

interface Content {
  id: string | number;
  title: string;
  description: string;
  type: string;
  content: string | null;
  content_attachments: { id: string | number; name: string; url: string; disk: string; mime_type: string }[];
}

const getFileTypeImage = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return require('../../../assets/icons/image.png');
    case 'pdf':
      return require('../../../assets/icons/pdf.png');
    case 'txt':
    case 'doc':
    case 'docx':
      return require('../../../assets/icons/text.png');
    case 'mp4':
    case 'mov':
    case 'avi':
      return require('../../../assets/icons/video.png');
    default:
      return require('../../../assets/icons/file.png'); // Default file image
  }
};

const getFileType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'Image';
    case 'pdf':
      return 'PDF';
    case 'txt':
    case 'doc':
    case 'docx':
      return 'Text';
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'Video';
    default:
      return 'File';
  }
};

const FileCard = ({ id, name, url, mime_type, onPress, showPreview }: any) => {
  return (
    <View>
      <TouchableOpacity style={styles.fileCard} onPress={onPress}>
        <Image source={getFileTypeImage(url)} style={styles.fileTypeImage} />
        <View style={styles.fileCardInfo}>
          <Text style={styles.fileCardName}>{name}</Text>
          <Text style={styles.fileCardType}>{getFileType(url)}</Text>
        </View>
        <FontAwesome name="download" size={24} color="#2467EC" />
      </TouchableOpacity>
      {showPreview && (
        <View style={{ marginTop: 10, height: 300, borderWidth: 1, borderColor: '#E1E9F8', borderRadius: 8 }}>
          {['jpg', 'jpeg', 'png', 'gif'].includes(url.split('.').pop()?.toLowerCase() || '') && (
            <Image source={{ uri: url }} style={{ flex: 1, resizeMode: 'contain' }} />
          )}
          {['mp4', 'mov', 'avi'].includes(url.split('.').pop()?.toLowerCase() || '') && (
            <WebView source={{ uri: url }} />
          )}
        </View>
      )}
    </View>
  );
};

export default function LessonContentScreen() {
  const { courseId, contentCategoryId, lessonId } = useLocalSearchParams();
  const [lessonContents, setLessonContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedContents, setExpandedContents] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchLessonContents = async () => {
      try {
        const response = await axiosInstance.get<{ data: { items: Content[] } }>(
          `v1/student/courses/${courseId}/content-categories/${contentCategoryId}/lessons/${lessonId}/contents`
        );
        const items = response.data.data.items;
        setLessonContents(items);
        if (items.length > 0) {
          setExpandedContents({ [items[0].id]: true });
        }
      } catch (error) {
        console.error("Error fetching lesson contents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonContents();
  }, [courseId, contentCategoryId, lessonId]);

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

  const handleDownloadAndOpen = async (url: string, name: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${name}`;
      await FileSystem.downloadAsync(url, fileUri);

      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
        });
      } else if (Platform.OS === 'ios') {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          // Fallback to opening the file if sharing is not available
          await Linking.openURL(fileUri);
        }
      }
    } catch (error) {
      console.error("Error downloading or opening file:", error);
      Alert.alert("Error", "There was an error downloading or opening the file.");
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Success", "Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };


  const toggleContentExpansion = (contentId: string | number) => {
    setExpandedContents(prev => ({
      ...prev,
      [contentId]: !prev[contentId],
    }));
  };

  const renderAttachment = (content: Content, attachment: Content['content_attachments'][0]) => {
    const isImageOrVideo = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'].includes(attachment.url.split('.').pop()?.toLowerCase() || '');

    return (
      <View key={attachment.id}>
        <FileCard
          id={attachment.id}
          name={attachment.name}
          url={attachment.url}
          mime_type={attachment.mime_type}
          onPress={() => handleDownloadAndOpen(attachment.url, attachment.name)}
          showPreview={isImageOrVideo}
        />
      </View>
    );
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <LinearGradient colors={['#E5ECF9', '#F6F7F9']} style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lesson Contents</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
              {lessonContents.map((content) => (
                <View key={content.id} style={styles.contentCard}>
                  <TouchableOpacity onPress={() => toggleContentExpansion(content.id)} style={styles.contentHeader}>
                    <Text style={styles.contentTitle}>{content.title}</Text>
                    <Ionicons name={expandedContents[content.id] ? "chevron-up" : "chevron-down"} size={24} color="black" />
                  </TouchableOpacity>
                  {expandedContents[content.id] && (
                    <>
                      <Text style={styles.contentDescription}>{content.description}</Text>
                      {content.type === "URL" && (
                        <View style={styles.urlContainer}>
                          <TextInput
                            value={content.content || ""}
                            editable={false}
                            style={styles.urlInput}
                          />
                          <TouchableOpacity onPress={() => handleCopyToClipboard(content.content || "")}>
                            <FontAwesome name="clipboard" size={24} color="#2467EC" style={styles.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => Linking.openURL(content.content || "")}>
                            <FontAwesome name="external-link" size={24} color="#2467EC" style={styles.icon} />
                          </TouchableOpacity>
                        </View>
                      )}
                      {content.type === "FILE" && content.content_attachments.length > 0 && (
                        content.content_attachments.map((attachment) => renderAttachment(content, attachment))
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
  },
  container: {
    marginHorizontal: 16,
    marginTop: 15,
  },
  contentCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E9F8',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  contentDescription: {
    color: "#525258",
    fontSize: 16,
    marginTop: 10,
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  urlInput: {
    flex: 1,
    padding: 10,
    borderColor: '#E1E9F8',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  icon: {
    marginLeft: 10,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E1E9F8',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#F9F9F9',
  },
  fileTypeImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  fileCardInfo: {
    flex: 1,
  },
  fileCardName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2467EC",
  },
  fileCardType: {
    fontSize: 14,
    color: "#808080",
  },
});
