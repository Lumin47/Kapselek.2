import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

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

type SortOption = 'name' | 'brewery' | 'none';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('none');
  const router = useRouter();

  const loadPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('photos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  useFocusEffect(() => {
    loadPhotos();
  });

  useEffect(() => {
    let filtered = [...photos];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(photo => 
        (photo.name?.toLowerCase() || '').includes(query) ||
        (photo.brewery?.toLowerCase() || '').includes(query) ||
        (photo.color?.toLowerCase() || '').includes(query) ||
        (photo.country?.toLowerCase() || '').includes(query)
      );
    }

    // Apply sorting
    if (sortOption === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'brewery') {
      filtered.sort((a, b) => (a.brewery || '').localeCompare(b.brewery || ''));
    }

    setFilteredPhotos(filtered);
  }, [searchQuery, photos, sortOption]);

  const deletePhoto = async (id: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPhotos = photos.filter(photo => photo.id !== id);
              await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
              setPhotos(updatedPhotos);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo.');
            }
          },
        },
      ]
    );
  };

  const renderPhoto = ({ item }: { item: Photo }) => {
    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => router.push({
          pathname: 'photo-details' as any,
          params: { id: item.id }
        })}
      >
        <View style={styles.photoWrapper}>
          <Image
            source={{ uri: item.uri }}
            style={styles.photo}
            resizeMode="cover"
          />
        </View>
        <View style={styles.photoInfo}>
          <Text style={styles.photoTitle}>{item.name}</Text>
          <Text style={styles.photoBrewery}>{item.brewery}</Text>
          <Text style={styles.photoColor}>Color: {item.color}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePhoto(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, brewery, color or country..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.sortButtons}>
          <TouchableOpacity 
            style={[styles.sortButton, sortOption === 'name' && styles.sortButtonActive]}
            onPress={() => setSortOption(sortOption === 'name' ? 'none' : 'name')}
          >
            <Text style={[styles.sortButtonText, sortOption === 'name' && styles.sortButtonTextActive]}>Sort by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortOption === 'brewery' && styles.sortButtonActive]}
            onPress={() => setSortOption(sortOption === 'brewery' ? 'none' : 'brewery')}
          >
            <Text style={[styles.sortButtonText, sortOption === 'brewery' && styles.sortButtonTextActive]}>Sort by Brewery</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filteredPhotos}
        renderItem={renderPhoto}
        keyExtractor={(item: Photo) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gallery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  sortButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sortButtonText: {
    color: '#000',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  gallery: {
    padding: 5,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 1,
    padding: 5,
  },
  photoWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.8 }],
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  photoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  photoBrewery: {
    fontSize: 10,
    color: '#fff',
    marginBottom: 2,
  },
  photoColor: {
    fontSize: 10,
    color: '#fff',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 10,
  },
}); 