import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CountryPicker } from 'react-native-country-codes-picker';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface Photo {
  id: string;
  uri: string;
  name: string;
  brewery: string;
  percentage: string;
  color: string;
  year: string;
  country: string;
  type: string;
  createdAt: string;
}

export default function PhotoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Stan
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhoto, setEditedPhoto] = useState<Photo | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Animowane wartości
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Callback do ładowania zdjęcia
  const loadPhoto = useCallback(async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('photos');
      if (savedPhotos) {
        const photos = JSON.parse(savedPhotos);
        const foundPhoto = photos.find((p: Photo) => p.id === id);
        if (foundPhoto) {
          setPhoto(foundPhoto);
          setEditedPhoto(foundPhoto);
        }
      }
    } catch (error) {
      console.error('Błąd podczas ładowania zdjęcia:', error);
    }
  }, [id]);

  // Efekt do ładowania zdjęcia
  useEffect(() => {
    loadPhoto();
  }, [loadPhoto]);

  // Callback do zapisywania zmian
  const saveChanges = useCallback(async () => {
    if (!editedPhoto) return;

    try {
      const savedPhotos = await AsyncStorage.getItem('photos');
      if (savedPhotos) {
        const photos = JSON.parse(savedPhotos);
        const updatedPhotos = photos.map((p: Photo) => 
          p.id === editedPhoto.id ? editedPhoto : p
        );
        await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
        setPhoto(editedPhoto);
        setIsEditing(false);
        Alert.alert('Sukces', 'Zmiany zostały zapisane!');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania zmian:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać zmian.');
    }
  }, [editedPhoto]);

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {photo && (
        <>
          <PinchGestureHandler
            onGestureEvent={useAnimatedGestureHandler({
              onStart: (_, context: any) => {
                context.startScale = scale.value;
              },
              onActive: (event: any, context: any) => {
                scale.value = context.startScale * event.scale;
                translateX.value = event.focalX;
                translateY.value = event.focalY;
              },
            })}
          >
            <Animated.View style={styles.imageContainer}>
              <Animated.Image
                source={{ uri: photo.uri }}
                style={[
                  styles.image,
                  useAnimatedStyle(() => ({
                    transform: [
                      { translateX: translateX.value },
                      { translateY: translateY.value },
                      { scale: scale.value },
                    ],
                  })),
                ]}
              />
            </Animated.View>
          </PinchGestureHandler>
          <ScrollView style={styles.scrollView}>
            <View style={styles.detailsContainer}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedPhoto?.name}
                    onChangeText={(text) => setEditedPhoto({ ...editedPhoto!, name: text })}
                    placeholder="Beer name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedPhoto?.brewery}
                    onChangeText={(text) => setEditedPhoto({ ...editedPhoto!, brewery: text })}
                    placeholder="Brewery"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedPhoto?.percentage}
                    onChangeText={(text) => setEditedPhoto({ ...editedPhoto!, percentage: text })}
                    placeholder="Alcohol percentage"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedPhoto?.color}
                    onChangeText={(text) => setEditedPhoto({ ...editedPhoto!, color: text })}
                    placeholder="Color"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedPhoto?.year}
                    onChangeText={(text) => setEditedPhoto({ ...editedPhoto!, year: text })}
                    placeholder="Production year"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.countryButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.countryButtonText}>
                      {editedPhoto?.country || 'Select country'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.countryButton}
                    onPress={() => setShowTypePicker(true)}
                  >
                    <Text style={styles.countryButtonText}>
                      {editedPhoto?.type || 'Select beer type'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={saveChanges}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.cancelButton]} 
                      onPress={() => {
                        setEditedPhoto(photo);
                        setIsEditing(false);
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{photo.name}</Text>
                  <Text style={styles.label}>Brewery:</Text>
                  <Text style={styles.value}>{photo.brewery}</Text>
                  <Text style={styles.label}>Alcohol percentage:</Text>
                  <Text style={styles.value}>{photo.percentage}%</Text>
                  <Text style={styles.label}>Color:</Text>
                  <Text style={styles.value}>{photo.color}</Text>
                  <Text style={styles.label}>Production year:</Text>
                  <Text style={styles.value}>{photo.year}</Text>
                  <Text style={styles.label}>Country:</Text>
                  <Text style={styles.value}>{photo.country}</Text>
                  <Text style={styles.label}>Beer type:</Text>
                  <Text style={styles.value}>{photo.type}</Text>
                  <Text style={styles.date}>
                    Added: {new Date(photo.createdAt).toLocaleString()}
                  </Text>
                  <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </>
      )}

      <CountryPicker
        show={showCountryPicker}
        pickerButtonOnPress={(item) => {
          setEditedPhoto({ ...editedPhoto!, country: item.name.en });
          setShowCountryPicker(false);
        }}
        lang="en"
        popularCountries={['pl', 'de', 'cz', 'gb', 'be', 'nl']}
        style={{
          modal: {
            height: '80%',
            backgroundColor: '#fff',
            borderRadius: 10,
          },
          backdrop: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          line: {
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          },
          itemsList: {
            backgroundColor: '#fff',
          },
          textInput: {
            height: 50,
            borderRadius: 5,
            padding: 10,
            backgroundColor: '#f5f5f5',
          },
          countryButtonStyles: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          },
          countryName: {
            fontSize: 16,
            color: '#000',
          },
          dialCode: {
            display: 'none',
          },
        }}
        onBackdropPress={() => setShowCountryPicker(false)}
      />

      {showTypePicker && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select beer type</Text>
            <ScrollView style={styles.modalList}>
              {['Lager', 'Pilsner', 'Wheat', 'Dark', 'Porter', 'Flavored', 'Other', 'Non-alcoholic', 'IPA', 'Craft'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalItem}
                  onPress={() => {
                    if (editedPhoto) {
                      setEditedPhoto({ ...editedPhoto, type });
                    }
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 300,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  scrollView: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  countryButtonText: {
    color: '#000',
    fontSize: 16,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 