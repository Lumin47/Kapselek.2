import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

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

export default function HomeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const router = useRouter();
  const [loaded, error] = useFonts({
    'PolandCanned': require('@/assets/fonts/PolandCannedIntoFuture-OxE3.ttf'),
    'PompadourBlack-KGGX': require('@/assets/fonts/PompadourBlack-KGGX.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('photos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error('Błąd podczas ładowania zdjęć:', error);
    }
  };

  if (!loaded && !error) {
    return null;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.counterContainer}>
            <Text style={[styles.counter, { fontFamily: 'PompadourBlack-KGGX' }]}>
              {photos.length}
            </Text>
            <Text style={[styles.counterLabel, { fontFamily: 'PolandCanned' }]}>CAPS</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/gallery')}
          >
            <Image 
              source={require('@/assets/images/gallery.png')} 
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/camera')}
          >
            <Image 
              source={require('@/assets/images/camera.png')} 
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/stats')}
          >
            <Image 
              source={require('@/assets/images/statistics.png')} 
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topContainer: {
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counter: {
    fontSize: 140,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 140,
  },
  counterLabel: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginTop: -20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  iconButton: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
  },
});
