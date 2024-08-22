import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, ActivityIndicator, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFonts, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_500Medium, Nunito_700Bold, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import axiosInstance from "@/utils/apiServises";
import * as DocumentPicker from 'expo-document-picker';
import FileCard from "@/components/cards/fileCard";
import * as FileSystem from 'expo-file-system';

interface Assignment {
  id: string | number;
  title: string;
  description: string;
  total_marks: number;
  dead_line: string;
  questions: Question[];
  submitted_at: string | null;
}

interface Question {
  id: string | number;
  title: string;
  type: string;
  options: string[];
  answers: string[];
  question_attatchments: any[];
  submitted_answers: SubmittedAnswer[];
}

interface SubmittedAnswer {
  id: string | number;
  text: string;
  result: number | null;
  answer_attachments: any[];
}

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AssignmentContentScreen() {
  const { courseId, contentCategoryId, assignmentId } = useLocalSearchParams();
  const { user, loading } = useUser();
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string[] }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: UploadedFile[] }>({});
  const [loadingQuestions, setLoadingQuestions] = useState<{ [key: string]: boolean }>({});
  const [downloadingFiles, setDownloadingFiles] = useState<{ [key: string]: boolean }>({});
  const [remainingTime, setRemainingTime] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  const fetchAssignmentDetails = useCallback(async () => {
    setLoadingAssignment(true);
    try {
      const response = await axiosInstance.get<{ data: Assignment }>(
        `v1/student/courses/${courseId}/course-content-categories/${contentCategoryId}/assignments/${assignmentId}`
      );
      const assignmentData = response.data.data;
      setAssignment(assignmentData);
      setIsSubmitted(assignmentData.submitted_at != null);

      const prevAnswers: { [key: string]: string[] } = {};
      const prevUploadedFiles: { [key: string]: UploadedFile[] } = {};

      assignmentData.questions.forEach(question => {
        if (question.submitted_answers.length > 0) {
          if (question.type === "ONE_CHOICE" || question.type === "TWO_CHOICES") {
            const submittedAnswer = JSON.parse(question.submitted_answers[0].text);
            prevAnswers[question.id.toString()] = submittedAnswer;
          } else if (question.type === "FILES") {
            const files = question.submitted_answers[0].answer_attachments.map(file => ({
              uri: file.url,
              name: file.name,
              type: 'application/octet-stream',
            }));
            prevUploadedFiles[question.id.toString()] = files;
          } else if (question.type === "TEXT") {
            const submittedText = JSON.parse(question.submitted_answers[0].text);
            prevAnswers[question.id.toString()] = submittedText;
          }
        }
      });

      setSelectedAnswers(prevAnswers);
      setUploadedFiles(prevUploadedFiles);
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    } finally {
      setFetchingDetails(false);
      setLoadingAssignment(false);
    }
  }, [courseId, contentCategoryId, assignmentId]);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  useEffect(() => {
    const calculateRemainingTime = () => {
      if (!assignment?.dead_line) return;

      const deadline = new Date(assignment.dead_line);
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setRemainingTime("Ended");
      } else {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    const interval = setInterval(calculateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [assignment?.dead_line]);

  const submitAnswer = useCallback(async (questionId: string | number, answers: string[]) => {
    if (remainingTime === "Ended" || isSubmitted) {
      Alert.alert('Error', 'The assignment cannot be modified.');
      return;
    }

    setLoadingQuestions(prev => ({ ...prev, [questionId.toString()]: true }));
    try {
      const formData = new FormData();
      answers.forEach((answer, index) => formData.append(`text[${index}]`, answer));
      await axiosInstance.post(`v1/student/questions/${questionId}/answer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(`Answer submitted for question ${questionId}`);
    } catch (error) {
      console.error(`Error submitting answer for question ${questionId}:`, error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [questionId.toString()]: false }));
    }
  }, [remainingTime, isSubmitted]);

  const handleFileUpload = async (questionId: string | number) => {
    if (remainingTime === "Ended" || isSubmitted) {
      Alert.alert('Error', 'The assignment cannot be modified.');
      return;
    }

    try {
      let result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: true });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoadingQuestions(prev => ({ ...prev, [questionId.toString()]: true }));
        const newFiles: UploadedFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || '',
        }));

        setUploadedFiles(prev => {
          const updated = {
            ...prev,
            [questionId.toString()]: [...(prev[questionId.toString()] || []), ...newFiles]
          };
          return updated;
        });

        const formData = new FormData();
        newFiles.forEach((file, index) => {
          formData.append(`answer_attachments[${index}]`, {
            uri: file.uri,
            type: file.type,
            name: file.name,
          } as any);
        });

        formData.append('id', questionId.toString());

        try {
          const response = await axiosInstance.post(`v1/student/questions/${questionId}/answer`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
            },
          });
          console.log(`Files uploaded successfully for question ${questionId}. Response:`, response.data);
        } catch (error) {
          console.error(`Error uploading files for question ${questionId}:`, error);
          Alert.alert('Error', 'Failed to upload files. Please try again.');
        } finally {
          setLoadingQuestions(prev => ({ ...prev, [questionId.toString()]: false }));
        }
      } else {
        console.log("File selection cancelled or failed");
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
    }
  };

  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    const fileUri = FileSystem.documentDirectory + fileName;
    setDownloadingFiles(prev => ({ ...prev, [fileName]: true }));

    try {
      const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
      console.log('File downloaded to:', uri);
      Alert.alert('Success', `File downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    } finally {
      setDownloadingFiles(prev => {
        const newDownloading = { ...prev };
        delete newDownloading[fileName];
        return newDownloading;
      });
    }
  };

  const handleRemoveFile = (questionId: string | number, fileIndex: number) => {
    if (remainingTime === "Ended" || isSubmitted) {
      Alert.alert('Error', 'The assignment cannot be modified.');
      return;
    }

    setUploadedFiles(prev => {
      const updated = { ...prev };
      updated[questionId.toString()] = updated[questionId.toString()].filter((_, index) => index !== fileIndex);
      return updated;
    });
  };

  const renderFilePreview = (file: UploadedFile, questionId: string | number, fileIndex: number) => {
    return (
      <View style={styles.filePreviewContainer} key={file.uri}>
        <Text style={styles.filePreviewName}>{file.name}</Text>
        {!isSubmitted && (
          <TouchableOpacity onPress={() => handleRemoveFile(questionId, fileIndex)} style={styles.removeButton}>
            <MaterialIcons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAttachment = (attachment: any) => {
    const isImage = (url: string) => {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
      return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    if (isImage(attachment.url)) {
      return (
        <Image
          key={attachment.id}
          source={{ uri: attachment.url }}
          style={styles.attachmentImage}
          resizeMode="contain"
        />
      );
    } else {
      return (
        <FileCard
          key={attachment.id}
          name={attachment.name}
          url={attachment.url}
          onPress={() => handleFileDownload(attachment.url, attachment.name)}
        />
      );
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: '#fff' }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: 'black' }]}>Assignment</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const handleAnswerChange = (questionId: string | number, answer: string, index: number = 0) => {
    if (isSubmitted) return;

    setSelectedAnswers(prev => {
      const updated = { ...prev };
      const currentAnswers = Array.isArray(updated[questionId.toString()])
        ? [...updated[questionId.toString()]]
        : [];

      if (index === 0) {
        // For single choice or text input
        updated[questionId.toString()] = [answer];
        submitAnswer(questionId, [answer]); // Auto-submit for single choice
      } else {
        // For multiple choice (e.g., TWO_CHOICES)
        const answerIndex = currentAnswers.indexOf(answer);
        if (answerIndex > -1) {
          // If the answer is already selected, remove it
          currentAnswers.splice(answerIndex, 1);
        } else {
          // If the answer is not selected, add it
          if (currentAnswers.length < 2) { // Assuming max two choices
            currentAnswers.push(answer);
          } else {
            currentAnswers[index % 2] = answer; // Replace the oldest answer if we already have two
          }
        }
        updated[questionId.toString()] = currentAnswers;

        // Submit answer if two choices are selected
        if (currentAnswers.length === 2) {
          submitAnswer(questionId, currentAnswers);
        }
      }

      return updated;
    });
  };

  const renderQuestions = () => (
    <View style={styles.questionsContainer}>
      {assignment?.questions.map((question: any, index: any) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          {question.question_attatchments.map((attachment: any) => renderAttachment(attachment))}
          {question.submitted_answers[0]?.result !== null && (
            <Text style={styles.resultText}>
              Result: {question.submitted_answers[0]?.result} / {question.total_marks}
            </Text>
          )}
          {question.type === "ONE_CHOICE" || question.type === "TWO_CHOICES" ? (
            question.options.map((option: any, optionIndex: any) => {
              const isSelected = Array.isArray(selectedAnswers[question.id.toString()]) &&
                selectedAnswers[question.id.toString()].includes(option);
              const isDisabled = remainingTime === "Ended" || isSubmitted || loadingQuestions[question.id.toString()];
              const isLastAnswer = Array.isArray(selectedAnswers[question.id.toString()]) &&
                (selectedAnswers[question.id.toString()].includes(option));
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleAnswerChange(question.id, option, question.type === "TWO_CHOICES" ? optionIndex : 0)}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                    isDisabled && styles.disabledOption,
                    isLastAnswer && styles.lastSelectedOption
                  ]}
                  disabled={isDisabled}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                    isDisabled && styles.disabledOptionText
                  ]}>{option}</Text>
                  {loadingQuestions[question.id.toString()] && isSelected && (
                    <ActivityIndicator size="small" color="#fff" style={styles.optionLoader} />
                  )}
                </TouchableOpacity>
              );
            })
          ) : question.type === "TEXT" ? (
            <View>
              <TextInput
                style={[styles.textInput, (remainingTime === "Ended" || isSubmitted) && styles.disabledTextInput]}
                multiline
                numberOfLines={4}
                placeholder="Add text here..."
                value={Array.isArray(selectedAnswers[question.id.toString()]) ? selectedAnswers[question.id.toString()][0] || '' : ''}
                onChangeText={(text) => handleAnswerChange(question.id, text, 0)}
                onBlur={() => submitAnswer(question.id, selectedAnswers[question.id.toString()] || [])}
                editable={!loadingQuestions[question.id.toString()] && remainingTime !== "Ended" && !isSubmitted}
              />
              {loadingQuestions[question.id.toString()] && (
                <ActivityIndicator size="small" color="#007AFF" style={styles.textInputLoader} />
              )}
            </View>
          ) : question.type === "FILES" ? (
            <View>
              <TouchableOpacity
                onPress={() => handleFileUpload(question.id)}
                style={[styles.fileUploadButton, (remainingTime === "Ended" || isSubmitted) && styles.disabledFileUploadButton]}
                disabled={loadingQuestions[question.id.toString()] || remainingTime === "Ended" || isSubmitted}
              >
                {loadingQuestions[question.id.toString()] ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.fileUploadButtonText}>Upload File</Text>
                )}
              </TouchableOpacity>
              {uploadedFiles[question.id.toString()] && uploadedFiles[question.id.toString()].map((file, fileIndex) => renderFilePreview(file, question.id, fileIndex))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );

  const handleSubmitAssignment = async () => {
    if (remainingTime === "Ended" || isSubmitted) {
      Alert.alert('Error', 'The assignment cannot be submitted.');
      return;
    }

    try {
      await axiosInstance.patch(`v1/student/courses/${courseId}/course-content-categories/${contentCategoryId}/assignments/${assignmentId}/submit`);
      Alert.alert('Success', 'Assignment submitted successfully.');
      setIsSubmitted(true);
      // Optionally, navigate back or disable further interactions
      router.back();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', 'Failed to submit assignment. Please try again.');
    }
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      {loading || fetchingDetails || loadingAssignment ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.assignmentContainer}>
              <Text style={styles.assignmentTitle}>{assignment?.title}</Text>
              <Text style={styles.assignmentDescription}>{assignment?.description}</Text>
              <Text style={styles.assignmentDeadline}>
                Deadline: {new Date(assignment?.dead_line ?? "").toLocaleString()}
                {" "}
                <Text style={[styles.remainingTime, remainingTime === "Ended" && styles.endedTime]}>
                  {remainingTime ? `(${remainingTime})` : ''}
                </Text>
              </Text>
              <Text style={styles.assignmentMarks}>Total Marks: {assignment?.total_marks}</Text>
              {isSubmitted && (
                <Text style={styles.submittedMessage}>
                  Assignment submitted on: {new Date(assignment?.submitted_at ?? "").toLocaleString()}
                </Text>
              )}
              {renderQuestions()}
              {!isSubmitted && (
                <TouchableOpacity
                  style={[styles.submitButton, (remainingTime === "Ended" || isSubmitted) && styles.disabledSubmitButton]}
                  onPress={handleSubmitAssignment}
                  disabled={remainingTime === "Ended" || isSubmitted}
                >
                  <Text style={styles.submitButtonText}>Submit Assignment</Text>
                </TouchableOpacity>
              )}
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
  assignmentContainer: {
    padding: 16,
  },
  assignmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Raleway_700Bold",
    marginBottom: 10,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Nunito_400Regular",
    marginBottom: 10,
  },
  assignmentDeadline: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Nunito_400Regular",
    marginBottom: 10,
  },
  remainingTime: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: "Nunito_600SemiBold",
  },
  assignmentMarks: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Nunito_400Regular",
    marginBottom: 20,
  },
  submittedMessage: {
    fontSize: 14,
    color: 'green',
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 20,
  },
  questionsContainer: {
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  lastSelectedOption: {
    borderColor: '#000',
    borderWidth: 2,
  },
  disabledOption: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: "Nunito_500Medium",
  },
  selectedOptionText: {
    color: '#fff',
  },
  disabledOptionText: {
    color: '#888',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: '#333',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  disabledTextInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  fileUploadButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledFileUploadButton: {
    backgroundColor: '#ccc',
  },
  fileUploadButtonText: {
    color: '#fff',
    fontFamily: "Nunito_600SemiBold",
  },
  filePreviewContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filePreviewName: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  endedTime: {
    color: 'red',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledSubmitButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  optionLoader: {
    position: 'absolute',
    right: 10,
  },
  textInputLoader: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
