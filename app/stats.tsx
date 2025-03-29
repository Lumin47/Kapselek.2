import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';

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
  const [colorData, setColorData] = useState<{ [key: string]: number }>({});
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
    const colors: { [key: string]: number } = {};

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
      if (photo.color) {
        colors[photo.color] = (colors[photo.color] || 0) + 1;
      }
    });

    setCountryData(countries);
    setPercentageData(percentages);
    setYearData(years);
    setTypeData(types);
    setBreweryData(breweries);
    setColorData(colors);
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
    const hue = (index * 137.508) % 360; // Golden angle
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

  const colorChartData = Object.entries(colorData).map(([name, count], index) => ({
    name,
    population: count,
    color: generateUniqueColor(index),
  }));

  // Funkcja pomocnicza do pobierania współrzędnych krajów
  const getCountryCoordinates = (country: string) => {
    const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
      // Europa
      'Andorra': { latitude: 42.5063, longitude: 1.5218 },
      'Albania': { latitude: 41.3275, longitude: 19.8187 },
      'Austria': { latitude: 48.2082, longitude: 16.3738 },
      'Belarus': { latitude: 53.9045, longitude: 27.5615 },
      'Belgium': { latitude: 50.8503, longitude: 4.3517 },
      'Bosnia and Herzegovina': { latitude: 43.8564, longitude: 18.4131 },
      'Bulgaria': { latitude: 42.6977, longitude: 23.3219 },
      'Croatia': { latitude: 45.8154, longitude: 15.9666 },
      'Cyprus': { latitude: 35.1856, longitude: 33.3823 },
      'Czech Republic': { latitude: 50.0755, longitude: 14.4378 },
      'Denmark': { latitude: 55.6761, longitude: 12.5683 },
      'Estonia': { latitude: 59.4370, longitude: 24.7536 },
      'Finland': { latitude: 60.1699, longitude: 24.9384 },
      'France': { latitude: 48.8566, longitude: 2.3522 },
      'Germany': { latitude: 52.5200, longitude: 13.4050 },
      'Greece': { latitude: 37.9838, longitude: 23.7275 },
      'Hungary': { latitude: 47.4979, longitude: 19.0402 },
      'Iceland': { latitude: 64.1265, longitude: -21.8174 },
      'Ireland': { latitude: 53.3498, longitude: -6.2603 },
      'Italy': { latitude: 41.9028, longitude: 12.4964 },
      'Kosovo': { latitude: 42.6026, longitude: 20.9030 },
      'Latvia': { latitude: 56.9496, longitude: 24.1052 },
      'Liechtenstein': { latitude: 47.1410, longitude: 9.5209 },
      'Lithuania': { latitude: 54.6872, longitude: 25.2797 },
      'Luxembourg': { latitude: 49.8153, longitude: 6.1296 },
      'Malta': { latitude: 35.8989, longitude: 14.5146 },
      'Moldova': { latitude: 47.0105, longitude: 28.8638 },
      'Monaco': { latitude: 43.7384, longitude: 7.4246 },
      'Montenegro': { latitude: 42.7087, longitude: 19.3744 },
      'Netherlands': { latitude: 52.3676, longitude: 4.9041 },
      'North Macedonia': { latitude: 42.0041, longitude: 21.4344 },
      'Norway': { latitude: 59.9139, longitude: 10.7522 },
      'Poland': { latitude: 52.2370, longitude: 21.0175 },
      'Portugal': { latitude: 38.7223, longitude: -9.1393 },
      'Romania': { latitude: 44.4268, longitude: 26.1025 },
      'Russia': { latitude: 55.7558, longitude: 37.6173 },
      'San Marino': { latitude: 43.9424, longitude: 12.4578 },
      'Serbia': { latitude: 44.7866, longitude: 20.4489 },
      'Slovakia': { latitude: 48.1486, longitude: 17.1077 },
      'Slovenia': { latitude: 46.0569, longitude: 14.5058 },
      'Spain': { latitude: 40.4168, longitude: -3.7038 },
      'Sweden': { latitude: 59.3293, longitude: 18.0686 },
      'Switzerland': { latitude: 47.3769, longitude: 8.5417 },
      'Turkey': { latitude: 41.0082, longitude: 28.9784 },
      'Ukraine': { latitude: 50.4501, longitude: 30.5234 },
      'United Kingdom': { latitude: 51.5074, longitude: -0.1278 },
      'Vatican City': { latitude: 41.9029, longitude: 12.4534 },

      // Część Azji
      'Afghanistan': { latitude: 34.5553, longitude: 69.2075 },
      'Armenia': { latitude: 40.1872, longitude: 44.5152 },
      'Azerbaijan': { latitude: 40.4093, longitude: 49.8671 },
      'Bahrain': { latitude: 26.0667, longitude: 50.5577 },
      'Bangladesh': { latitude: 23.8103, longitude: 90.4125 },
      'Bhutan': { latitude: 27.4712, longitude: 89.6386 },
      'Brunei': { latitude: 4.9031, longitude: 114.9398 },
      'Cambodia': { latitude: 11.5564, longitude: 104.9282 },
      'China': { latitude: 39.9042, longitude: 116.4074 },
      'Georgia': { latitude: 41.7151, longitude: 44.8271 },
      'India': { latitude: 28.6139, longitude: 77.2090 },
      'Indonesia': { latitude: -6.2088, longitude: 106.8456 },
      'Iran': { latitude: 35.6892, longitude: 51.3890 },
      'Iraq': { latitude: 33.3152, longitude: 44.3661 },
      'Israel': { latitude: 31.7683, longitude: 35.2137 },
      'Japan': { latitude: 35.6895, longitude: 139.6917 },
      'Jordan': { latitude: 31.9522, longitude: 35.9334 },
      'Kazakhstan': { latitude: 43.2220, longitude: 76.8512 },
      'Kuwait': { latitude: 29.3759, longitude: 47.9774 },
      'Kyrgyzstan': { latitude: 41.2044, longitude: 74.7661 },
      'Laos': { latitude: 17.9757, longitude: 102.6331 },
      'Lebanon': { latitude: 33.8547, longitude: 35.8623 },
      'Malaysia': { latitude: 3.1412, longitude: 101.6865 },
      'Maldives': { latitude: 4.1755, longitude: 73.5093 },
      'Mongolia': { latitude: 47.8864, longitude: 106.9057 },
      'Myanmar': { latitude: 16.8661, longitude: 96.1951 },
      'Nepal': { latitude: 27.7172, longitude: 85.3240 },
      'North Korea': { latitude: 39.0392, longitude: 125.7625 },
      'Oman': { latitude: 23.4241, longitude: 53.8478 },
      'Pakistan': { latitude: 33.6844, longitude: 73.0479 },
      'Palestine': { latitude: 31.9522, longitude: 35.2334 },
      'Philippines': { latitude: 14.5995, longitude: 120.9842 },
      'Qatar': { latitude: 25.3548, longitude: 51.1839 },
      'Saudi Arabia': { latitude: 24.7136, longitude: 46.6753 },
      'Singapore': { latitude: 1.3521, longitude: 103.8198 },
      'South Korea': { latitude: 37.5665, longitude: 126.9780 },
      'Sri Lanka': { latitude: 6.9271, longitude: 79.8612 },
      'Syria': { latitude: 33.5138, longitude: 36.2765 },
      'Taiwan': { latitude: 25.0330, longitude: 121.5654 },
      'Tajikistan': { latitude: 38.5737, longitude: 68.7738 },
      'Thailand': { latitude: 13.7563, longitude: 100.5018 },
      'Timor-Leste': { latitude: -8.5569, longitude: 125.5603 },
      'Turkmenistan': { latitude: 37.9601, longitude: 58.3261 },
      'United Arab Emirates': { latitude: 25.2048, longitude: 55.2708 },
      'Uzbekistan': { latitude: 41.2995, longitude: 69.2401 },
      'Vietnam': { latitude: 21.0278, longitude: 105.8342 },
      'Yemen': { latitude: 15.3694, longitude: 44.1910 },

      // Afryka
      'Algeria': { latitude: 36.7538, longitude: 3.0588 },
      'Angola': { latitude: -8.8389, longitude: 13.2894 },
      'Benin': { latitude: 6.4969, longitude: 2.6283 },
      'Botswana': { latitude: -24.6282, longitude: 25.9231 },
      'Burkina Faso': { latitude: 12.3714, longitude: -1.5197 },
      'Burundi': { latitude: -3.3614, longitude: 29.3599 },
      'Cameroon': { latitude: 3.8480, longitude: 11.5021 },
      'Cape Verde': { latitude: 14.9315, longitude: -23.5087 },
      'Central African Republic': { latitude: 4.3947, longitude: 18.5582 },
      'Chad': { latitude: 12.1348, longitude: 15.0557 },
      'Comoros': { latitude: -11.7172, longitude: 43.2473 },
      'Congo': { latitude: -4.2634, longitude: 15.2429 },
      'Democratic Republic of the Congo': { latitude: -4.4419, longitude: 15.2663 },
      'Djibouti': { latitude: 11.5886, longitude: 43.1456 },
      'Egypt': { latitude: 30.0444, longitude: 31.2357 },
      'Equatorial Guinea': { latitude: 3.7523, longitude: 8.7800 },
      'Eritrea': { latitude: 15.3229, longitude: 38.9251 },
      'Eswatini': { latitude: -26.3054, longitude: 31.1367 },
      'Ethiopia': { latitude: 9.0320, longitude: 38.7420 },
      'Gabon': { latitude: 0.4162, longitude: 9.4673 },
      'Gambia': { latitude: 13.4432, longitude: -15.3101 },
      'Ghana': { latitude: 5.6030, longitude: -0.1870 },
      'Guinea': { latitude: 9.5092, longitude: -13.7122 },
      'Guinea-Bissau': { latitude: 11.8817, longitude: -15.6178 },
      'Kenya': { latitude: -1.2921, longitude: 36.8219 },
      'Lesotho': { latitude: -29.3167, longitude: 27.4833 },
      'Liberia': { latitude: 6.3004, longitude: -10.7969 },
      'Libya': { latitude: 32.8872, longitude: 13.1913 },
      'Madagascar': { latitude: -18.8792, longitude: 47.5079 },
      'Malawi': { latitude: -13.9626, longitude: 33.7741 },
      'Mali': { latitude: 12.6392, longitude: -8.0029 },
      'Mauritania': { latitude: 18.0735, longitude: -15.9582 },
      'Mauritius': { latitude: -20.1609, longitude: 57.5012 },
      'Morocco': { latitude: 31.6295, longitude: -7.9811 },
      'Mozambique': { latitude: -25.9692, longitude: 32.5732 },
      'Namibia': { latitude: -22.5609, longitude: 17.0658 },
      'Niger': { latitude: 13.5117, longitude: 2.1252 },
      'Nigeria': { latitude: 9.0765, longitude: 7.3986 },
      'Rwanda': { latitude: -1.9441, longitude: 30.0619 },
      'São Tomé and Príncipe': { latitude: 0.1864, longitude: 6.6131 },
      'Senegal': { latitude: 14.7167, longitude: -17.4571 },
      'Seychelles': { latitude: -4.6796, longitude: 55.4920 },
      'Sierra Leone': { latitude: 8.4841, longitude: -13.2347 },
      'Somalia': { latitude: 2.0469, longitude: 45.3182 },
      'South Africa': { latitude: -33.9249, longitude: 18.4241 },
      'South Sudan': { latitude: 4.8594, longitude: 31.5713 },
      'Sudan': { latitude: 15.5007, longitude: 32.5599 },
      'Tanzania': { latitude: -6.7924, longitude: 39.2083 },
      'Togo': { latitude: 6.1725, longitude: 1.2314 },
      'Tunisia': { latitude: 36.8065, longitude: 10.1815 },
      'Uganda': { latitude: 0.3476, longitude: 32.5825 },
      'Zambia': { latitude: -15.3875, longitude: 28.3228 },
      'Zimbabwe': { latitude: -17.8277, longitude: 31.0534 },

      // Ameryka Północna
      'Antigua and Barbuda': { latitude: 17.0608, longitude: -61.7964 },
      'Bahamas': { latitude: 25.0343, longitude: -77.3963 },
      'Barbados': { latitude: 13.1939, longitude: -59.5432 },
      'Belize': { latitude: 17.1899, longitude: -88.4977 },
      'Canada': { latitude: 45.4215, longitude: -75.6972 },
      'Costa Rica': { latitude: 9.9281, longitude: -84.0907 },
      'Cuba': { latitude: 23.1136, longitude: -82.3666 },
      'Dominica': { latitude: 15.3004, longitude: -61.3872 },
      'Dominican Republic': { latitude: 18.4861, longitude: -69.9312 },
      'El Salvador': { latitude: 13.6929, longitude: -89.2182 },
      'Grenada': { latitude: 12.0561, longitude: -61.7488 },
      'Guatemala': { latitude: 14.6349, longitude: -90.5069 },
      'Haiti': { latitude: 18.5944, longitude: -72.3074 },
      'Honduras': { latitude: 14.0723, longitude: -87.1921 },
      'Jamaica': { latitude: 18.0469, longitude: -76.7408 },
      'Mexico': { latitude: 19.4326, longitude: -99.1332 },
      'Nicaragua': { latitude: 12.1150, longitude: -86.2362 },
      'Panama': { latitude: 8.9833, longitude: -79.5167 },
      'Saint Kitts and Nevis': { latitude: 17.3578, longitude: -62.7830 },
      'Saint Lucia': { latitude: 14.0101, longitude: -60.9875 },
      'Saint Vincent and the Grenadines': { latitude: 13.1939, longitude: -61.2225 },
      'Trinidad and Tobago': { latitude: 10.6918, longitude: -61.2225 },
      'United States': { latitude: 38.9072, longitude: -77.0369 },

      // Ameryka Południowa
      'Argentina': { latitude: -34.6037, longitude: -58.3816 },
      'Bolivia': { latitude: -16.4897, longitude: -68.1193 },
      'Brazil': { latitude: -15.7801, longitude: -47.9292 },
      'Chile': { latitude: -33.4489, longitude: -70.6693 },
      'Colombia': { latitude: 4.5709, longitude: -74.2973 },
      'Ecuador': { latitude: -0.1807, longitude: -78.4678 },
      'Guyana': { latitude: 6.8013, longitude: -58.1551 },
      'Paraguay': { latitude: -25.2637, longitude: -57.5759 },
      'Peru': { latitude: -12.0464, longitude: -77.0428 },
      'Suriname': { latitude: 5.8520, longitude: -55.2038 },
      'Uruguay': { latitude: -34.9011, longitude: -56.1645 },
      'Venezuela': { latitude: 10.4806, longitude: -66.9036 },

      // Oceania
      'Australia': { latitude: -35.2809, longitude: 149.1300 },
      'Fiji': { latitude: -18.1416, longitude: 178.4419 },
      'Kiribati': { latitude: 1.3291, longitude: 172.9791 },
      'Marshall Islands': { latitude: 7.0897, longitude: 171.3809 },
      'Micronesia': { latitude: 6.9147, longitude: 158.1610 },
      'Nauru': { latitude: -0.5228, longitude: 166.9319 },
      'New Zealand': { latitude: -41.2865, longitude: 174.7762 },
      'Palau': { latitude: 7.5150, longitude: 134.5825 },
      'Papua New Guinea': { latitude: -9.4438, longitude: 147.1803 },
      'Samoa': { latitude: -13.8507, longitude: -171.7514 },
      'Solomon Islands': { latitude: -9.4456, longitude: 159.9729 },
      'Tonga': { latitude: -21.1393, longitude: -175.2049 },
      'Tuvalu': { latitude: -8.5200, longitude: 179.1980 },
      'Vanuatu': { latitude: -17.7333, longitude: 168.3273 },
    };
    return coordinates[country] || null;
  };

  return (
    <ScrollView style={styles.container}>
      {Object.keys(countryData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Beer Caps Collection</Text>
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

      {Object.keys(colorData).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Caps Colors</Text>
          <PieChart
            data={colorChartData}
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
          <BarChart
            data={{
              labels: Object.keys(percentageData),
              datasets: [{
                data: Object.values(percentageData),
              }],
            }}
            width={Dimensions.get('window').width - 35}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={90}
            showValuesOnTopOfBars={true}
            withVerticalLabels={true}
            segments={4}
            yAxisLabel=""
            yAxisSuffix=""
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
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
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
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
  }
}); 