import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { Tabs } from 'expo-router';

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

export default function StatsScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countryData, setCountryData] = useState<{ [key: string]: number }>({});
  const [percentageData, setPercentageData] = useState<{ [key: string]: number }>({});
  const [yearData, setYearData] = useState<{ [key: string]: number }>({});
  const [typeData, setTypeData] = useState<{ [key: string]: number }>({});
  const [breweryData, setBreweryData] = useState<{ [key: string]: number }>({});
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadPhotos();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('photos');
      if (savedPhotos) {
        const photos = JSON.parse(savedPhotos);
        setPhotos(photos);
        calculateStats(photos);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const getPercentageRange = (percentage: number): string => {
    if (percentage === 0) return '0%';
    if (percentage <= 4) return '0-4%';
    if (percentage <= 5) return '4-5%';
    if (percentage <= 6) return '5-6%';
    if (percentage <= 7) return '6-7%';
    return '>7%';
  };

  const getAllPercentageRanges = () => {
    const ranges = ['0%', '0-4%', '4-5%', '5-6%', '6-7%', '>7%'];
    const data: { [key: string]: number } = {};
    ranges.forEach(range => {
      data[range] = 0;
    });
    return data;
  };

  const calculateStats = (photos: Photo[]) => {
    const countries: { [key: string]: number } = {};
    const percentages = getAllPercentageRanges();
    const years: { [key: string]: number } = {};
    const types: { [key: string]: number } = {};
    const breweries: { [key: string]: number } = {};

    photos.forEach(photo => {
      if (photo.country) {
        countries[photo.country] = (countries[photo.country] || 0) + 1;
      }
      if (photo.percentage) {
        const range = getPercentageRange(parseFloat(photo.percentage));
        percentages[range] = (percentages[range] || 0) + 1;
      }
      if (photo.year) {
        years[photo.year] = (years[photo.year] || 0) + 1;
      }
      if (photo.type) {
        types[photo.type] = (types[photo.type] || 0) + 1;
      }
      if (photo.brewery) {
        breweries[photo.brewery] = (breweries[photo.brewery] || 0) + 1;
      }
    });

    setCountryData(countries);
    setPercentageData(percentages);
    setYearData(years);
    setTypeData(types);
    setBreweryData(breweries);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const generateUniqueColor = (index: number) => {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const typeChartData = Object.entries(typeData).map(([name, count], index) => ({
    name,
    population: count,
    color: generateUniqueColor(index),
  }));

  const breweryChartData = Object.entries(breweryData).map(([name, count], index) => ({
    name,
    population: count,
    color: generateUniqueColor(index),
  }));

  const countryChartData = Object.entries(countryData).map(([name, count], index) => ({
    name,
    population: count,
    color: generateUniqueColor(index),
  }));

  const getCountryCoordinates = (country: string) => {
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
      'Poland': { latitude: 52.2370, longitude: 21.0175 },
      'Germany': { latitude: 52.5200, longitude: 13.4050 },
      'Czech Republic': { latitude: 50.0755, longitude: 14.4378 },
      'United Kingdom': { latitude: 51.5074, longitude: -0.1278 },
      'Belgium': { latitude: 50.8503, longitude: 4.3517 },
      'Netherlands': { latitude: 52.3676, longitude: 4.9041 },
      // Dodaj więcej krajów według potrzeb
    };
    return coordinates[country] || null;
  };

  return (
    <ScrollView style={styles.container}>
      {Object.keys(countryData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Kapselek</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 52.237049,
                longitude: 21.017532,
                latitudeDelta: 15,
                longitudeDelta: 15,
              }}
              mapType="standard"
              zoomEnabled={true}
              scrollEnabled={true}
            >
              {Object.keys(countryData).map((country) => {
                const coordinates = getCountryCoordinates(country);
                if (coordinates) {
                  return (
                    <Marker
                      key={country}
                      coordinate={coordinates}
                      title={country}
                      description={`${countryData[country]} beers`}
                      pinColor="#2196F3"
                    />
                  );
                }
                return null;
              })}
            </MapView>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {Object.keys(countryData).length} unique countries
            </Text>
            <Text style={styles.statsPercentage}>
              {((Object.keys(countryData).length / 195) * 100).toFixed(1)}% of all countries
            </Text>
          </View>
          <PieChart
            data={countryChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[10, 10]}
            avoidFalseZero={true}
          />
        </View>
      )}

      {Object.keys(percentageData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Alcohol Percentage</Text>
          <View style={styles.lineChartContainer}>
            <LineChart
              data={{
                labels: Object.keys(percentageData),
                datasets: [{
                  data: Object.values(percentageData),
                }],
              }}
              width={Dimensions.get('window').width - 60}
              height={198}
              chartConfig={{
                ...chartConfig,
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
                marginLeft: -60,
              }}
              bezier
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withVerticalLines={true}
              withHorizontalLines={true}
              segments={4}
            />
          </View>
        </View>
      )}

      {Object.keys(yearData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Production Years</Text>
          <BarChart
            data={{
              labels: Object.keys(yearData),
              datasets: [{
                data: Object.values(yearData),
              }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            showValuesOnTopOfBars={true}
            withVerticalLabels={true}
            segments={4}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
      )}

      {Object.keys(typeData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Beer Types</Text>
          <PieChart
            data={typeChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[10, 10]}
            avoidFalseZero={true}
          />
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {Object.keys(typeData).length} unique types
            </Text>
          </View>
        </View>
      )}

      {Object.keys(breweryData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Breweries</Text>
          <PieChart
            data={breweryChartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[10, 10]}
            avoidFalseZero={true}
          />
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {Object.keys(breweryData).length} unique breweries
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statsPercentage: {
    fontSize: 14,
    color: '#999',
  },
  mapContainer: {
    height: 300,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  lineChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginLeft: -40,
  },
}); 