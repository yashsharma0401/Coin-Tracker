import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const CoinChart = ({ route }) => {
  const { coinSymbol } = route.params;
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${coinSymbol}&interval=1d&limit=30`
        );
        const data = await response.json();

        const chartData = data.map((item) => ({
          timestamp: item[0], // Open time
          close: parseFloat(item[4]), // Close price
        }));

        setChartData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    if (coinSymbol) {
      fetchChartData();
    } else {
      // Reset chartData if no coin symbol is provided
      setChartData(null);
    }
  }, [coinSymbol]);

  const renderChart = () => {
    if (chartData) {
      const chartDataPoints = chartData.map((item) => ({
        x: moment(item.timestamp).format('YYYY-MM-DD'),
        y: item.close,
      }));

      const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      };

      if (Platform.OS === 'web') {
        console.log(chartDataPoints);
        return (
          <LineChart
            data={{
              datasets: [{ data: chartDataPoints }],
            }}
            width={300}
            height={200}
            chartConfig={chartConfig}
          />
        );
      } else {
        return (
          <LineChart
            data={{
              datasets: [{ data: chartDataPoints }],
            }}
            width={300}
            height={200}
            chartConfig={chartConfig}
            bezier
          />
        );
      }
    } else {
      return <Text>Loading chart data...</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {coinSymbol ? (
        <>
          <Text style={styles.title}>{coinSymbol}</Text>
          {renderChart()}
        </>
      ) : (
        <Text>No coin selected.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default CoinChart;
