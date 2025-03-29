import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'KAPSELEK',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: 'New Photo',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="photo-details"
        options={{
          title: 'Photo Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
