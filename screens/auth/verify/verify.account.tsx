import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Button from "@/components/button/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";
import axiosInstance from "@/utils/apiServises";

export default function ResetPasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSumbit = async () => {
    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    };

    try {
      const response = await axiosInstance.post(
        `v1/auth/students/change-password`,
        payload
      );
      Toast.show("Your password has been changed successfully!", {
        type: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/(routes)/login");
    } catch (error) {
      console.log(error)
      Toast.show("Failed to change password. Please try again!", {
        type: "danger",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Reset Password</Text>
      <Text style={styles.subText}>
        Please enter your current password and a new password to reset your
        password.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Button title="Submit" onPress={handleSumbit} />
      </View>
      <View style={styles.loginLink}>
        <Text style={[styles.backText, { fontFamily: "Nunito_700Bold" }]}>
          Back To?
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { fontFamily: "Nunito_700Bold" }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputBox: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "left",
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#3876EE",
    marginLeft: 5,
    fontSize: 16,
  },
  backText: { fontSize: 16 },
});
