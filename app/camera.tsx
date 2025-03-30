import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ScrollView } from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { CountryPicker } from 'react-native-country-codes-picker';

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

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>("back");
  const [name, setName] = useState('');
  const [brewery, setBrewery] = useState('');
  const [percentage, setPercentage] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [country, setCountry] = useState('');
  const [beerType, setBeerType] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const beerTypes = ['Lager', 'Pilsner', 'Pszeniczne', 'Ciemne', 'Porter', 'Smakowe', 'Inne', 'Bezalkoholowe', 'IPA', 'Kraftowe'];

  const onCameraReady = () => {
    console.log('Camera ready');
    setIsCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setTempPhoto(photo.uri);
          setShowForm(true);
        }
      } catch (error) {
        console.error('Error while taking picture:', error);
        Alert.alert('Error', 'Failed to take photo.');
      }
    }
  };

  const savePhoto = async () => {
    if (tempPhoto) {
      try {
        const newPhoto = {
          id: Date.now().toString(),
          uri: tempPhoto,
          name,
          brewery,
          percentage,
          color,
          year,
          country,
          type: beerType,
          createdAt: new Date().toISOString(),
        };

        const existingPhotos = await AsyncStorage.getItem('photos');
        const photos = existingPhotos ? JSON.parse(existingPhotos) : [];
        photos.push(newPhoto);
        await AsyncStorage.setItem('photos', JSON.stringify(photos));

        Alert.alert('Success', 'Photo has been saved!');
        router.push('/');
      } catch (error) {
        console.error('Error while saving photo:', error);
        Alert.alert('Error', 'Failed to save the photo.');
      }
    }
  };

  if (permission?.granted == false) {
    return (
      <View style={styles.container}>
        <Text>Camera access required</Text>
        <TouchableOpacity style={styles.button} onPress={() => requestPermission()}>
          <Text style={styles.text}>Grant access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        onCameraReady={onCameraReady}
        ref={cameraRef}
      >
        <View style={styles.overlayContainer}>
          <Image 
            source={require('@/assets/images/capcamera.png')} 
            style={styles.overlay}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Beer name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Brewery"
            value={brewery}
            onChangeText={setBrewery}
          />
          <TextInput
            style={styles.input}
            placeholder="Alcohol percentage"
            value={percentage}
            onChangeText={setPercentage}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            value={color}
            onChangeText={setColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Production year"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.countryButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryButtonText}>
              {country || 'Select country'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.countryButton}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={styles.countryButtonText}>
              {beerType || 'Select beer type'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCountryPicker && (
        <CountryPicker
          show={showCountryPicker}
          pickerButtonOnPress={(item: any) => {
            setCountry(item.name.en);
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
      )}

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
                    setBeerType(type);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '96%',
    height: '96%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  formContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  text: {
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 