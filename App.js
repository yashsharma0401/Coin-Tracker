import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const CoinTable = ({ coinData }) => {
  const navigation = useNavigation();

  const handleCoinPress = (coin) => {
    navigation.navigate('CoinChart', { coinSymbol: coin });
  };

  const renderRow = ({ item }) => {
    return (
      <TouchableOpacity style={styles.rowContainer} onPress={() => handleCoinPress(item.symbol)}>
        <Text style={styles.rowText}>{item.symbol}</Text>
        <Text style={styles.rowText}>{item.price}</Text>
        <Text style={styles.rowText}>{item.volume}</Text> {/* Display volume */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={coinData}
        renderItem={renderRow}
        keyExtractor={(item) => `${item.symbol}-${item.id}`}
      />
    </View>
  );
};

const CoinChart = ({ route }) => {
  const { coinSymbol } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{coinSymbol}</Text>
      {/* Render the chart here */}
    </View>
  );
};

const App = () => {
  const [coinData, setCoinData] = useState([]);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await response.json();
        // Fetch volume data for each coin
        const updatedData = await Promise.all(
          data.map(async (coin) => {
            const symbol = coin.symbol;
            const volumeResponse = await fetch(
              `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h`
            );
            const volumeData = await volumeResponse.json();
            const volume = volumeData[0][5]; // Assuming volume is in the same format as the example response
            return { ...coin, volume };
          })
        );
        setCoinData(updatedData);
      } catch (error) {
        console.error('Error fetching coin data:', error);
      }
    };

    fetchCoinData();
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="CoinTable" options={{ title: 'Coin Table' }}>
            {(props) => <CoinTable {...props} coinData={coinData} />}
          </Stack.Screen>
          <Stack.Screen name="CoinChart" component={CoinChart} options={{ title: 'Coin Chart' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowText: {
    flex: 1,
  },
});

export default App;
