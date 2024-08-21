import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import { PermissionsAndroid, Platform } from 'react-native';
import axiosInstance from './apiServises';

export const registerForPushNotificationsAsync = async () => {
  try {
    console.log("Requesting user permissions for push notifications...");
    await requestUserPermission();
  } catch (error) {
    console.error('Error requesting push notification permissions:', error);
  }
};

export const requestUserPermission = async () => {
  console.log("Requesting user permission...");

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    console.log("Android permission status:", granted);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      await getFCMToken();
    } else {
      console.log("Permission denied");
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      await getFCMToken();
    }
  }
};

const getFCMToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();

    let fcmToken = await AsyncStorage.getItem('fcm_token');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcm_token', fcmToken);
      console.log("New FCM token generated:", fcmToken);
    } else {
      console.log("Existing FCM token:", fcmToken);
    }

    // Send the FCM token and device information to your backend
    await sendDeviceInfoToBackend(fcmToken);

  } catch (error) {
    console.log("Error during generating FCM token:", error);
    throw error;
  }
};

const sendDeviceInfoToBackend = async (fcmToken:any) => {
  try {
    const uniqueId = Device.osInternalBuildId || Device.osBuildId || 'unknown_id';
    const brand = Device.brand || 'unknown_brand';
    const model = Device.modelName || 'unknown_model';
    const deviceType = Device.deviceName || 'unknown_device';
    const readableVersion = '1.0.0'; // Update this according to your app versioning
    const os = Device.osName || Platform.OS;
    const systemVersion = Device.osVersion || 'unknown_version';

    const payload = {
      unique_id: uniqueId,
      platform_token: fcmToken,
      brand: brand,
      model: model,
      device_type: deviceType,
      readable_version: readableVersion,
      os: os,
      system_version: systemVersion,
      revoked: false, // Optional, modify if needed
    };

    console.log('Sending device info to backend:', payload);

    const response = await axiosInstance.post('/v1/auth/students/devices', payload);

    console.log('Device info sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending device info to backend:', error);
    throw error;
  }
};
