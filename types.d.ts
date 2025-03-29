declare function require(path: string): any;

declare module 'react/jsx-runtime' {
  export default any;
}

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useRef<T>(initialValue: T | null): React.MutableRefObject<T | null>;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T;
  export function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & React.ReducerState<R>,
    initializer?: (arg: I & React.ReducerState<R>) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
}

declare module 'react-native';
declare module '@react-native-async-storage/async-storage';
declare module 'react-native-country-codes-picker';
declare module 'react-native-gesture-handler';
declare module 'react-native-reanimated';
declare module 'expo-router';
declare module 'expo-camera' {
  export enum CameraType {
    back = 'back',
    front = 'front'
  }
  
  export interface CameraProps {
    type?: CameraType;
    style?: any;
    onCameraReady?: () => void;
    onMountError?: (error: Error) => void;
    ref?: React.RefObject<Camera | null>;
    children?: React.ReactNode;
  }

  export class Camera extends React.Component<CameraProps> {
    takePictureAsync(): Promise<{ uri: string }>;
  }

  export function requestCameraPermissionsAsync(): Promise<{ status: string }>;
}
declare module 'expo-constants';
declare module 'expo-linking';
declare module 'expo-splash-screen';
declare module 'expo-status-bar';
declare module 'expo-system-ui';
declare module 'expo-web-browser';
declare module 'expo-blur';
declare module 'expo-font';
declare module 'expo-haptics';
declare module 'expo-image-picker';
declare module 'expo-media-library';
declare module 'expo-file-system';
declare module 'expo-image-manipulator';
declare module 'expo-dev-client';

declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'react-native-image-zoom' {
  import { Component } from 'react';
  import { ViewStyle, ImageStyle } from 'react-native';

  interface ImageZoomProps {
    cropWidth: number;
    cropHeight: number;
    imageWidth: number;
    imageHeight: number;
    style?: ViewStyle;
    imageStyle?: ImageStyle;
    children: React.ReactNode;
  }

  export default class ImageZoom extends Component<ImageZoomProps> {}
}

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

declare module 'react-native' {
  export interface FlatListProps<T> {
    data: T[];
    renderItem: ({ item }: { item: T }) => React.ReactElement;
    keyExtractor: (item: T) => string;
    numColumns?: number;
    contentContainerStyle?: any;
  }
  
  export class FlatList<T> extends React.Component<FlatListProps<T>> {}
  export interface ListRenderItem<T> {
    item: T;
    index: number;
    separators: {
      highlight: () => void;
      unhighlight: () => void;
      updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
    };
  }
} 