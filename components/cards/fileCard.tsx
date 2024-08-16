import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const getFileTypeImage = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return require('@/assets/icons/image.png');
    case 'pdf':
      return require('@/assets/icons/pdf.png');
    case 'txt':
    case 'doc':
    case 'docx':
      return require('@/assets/icons/text.png');
    case 'mp4':
    case 'mov':
    case 'avi':
      return require('@/assets/icons/video.png');
    default:
      return require('@/assets/icons/file.png');
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

const FileCard = ({ name, url, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.fileCard} onPress={onPress}>
      <Image source={getFileTypeImage(url)} style={styles.fileTypeImage} />
      <View style={styles.fileCardInfo}>
        <Text style={styles.fileCardName}>{name}</Text>
        <Text style={styles.fileCardType}>{getFileType(url)}</Text>
      </View>
      <FontAwesome name="download" size={24} color="#2467EC" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '500',
    color: '#2467EC',
  },
  fileCardType: {
    fontSize: 14,
    color: '#808080',
  },
});

export default FileCard;
