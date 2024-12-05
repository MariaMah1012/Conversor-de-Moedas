import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth, useUser } from "@clerk/clerk-expo";
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, Keyboard } from "react-native";
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const [currencies, setCurrencies] = useState([
    { code: 'BRL', name: 'Real (BRL)',  },
    { code: 'USD', name: 'Dólar (USD)', },
    { code: 'EUR', name: 'Euro (EUR)',  },
    { code: 'GBP', name: 'Libra (GBP)',  },
  ]);

  const [amounts, setAmounts] = useState({ BRL: '' });
  const [rates, setRates] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/BRL');
      setRates(response.data.rates);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      Alert.alert('Erro', 'Erro ao obter as cotações.');
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const handleAmountChange = (currency, value) => {
    const numericValue = value.replace(/[^\d.-]/g, '');  
    
    setAmounts((prevAmounts) => {
      const newAmounts = { ...prevAmounts, [currency]: numericValue };

      Object.keys(rates).forEach((curr) => {
        if (curr !== currency) {
          newAmounts[curr] = ((parseFloat(numericValue) || 0) * rates[curr] / rates[currency]).toFixed(2);
        }
      });

      return newAmounts;
    });
  };

  const handleSubmitEditing = (currency, text) => {
    handleAmountChange(currency, text);
    Keyboard.dismiss(); 
  };

  const CurrencyInput = ({ currency, value }) => {
    const [tempValue, setTempValue] = useState(value); 

    return (
      <View style={styles.currencyInput}>
        <Image source={{ uri: currency.flag }} style={styles.flag} />
        <Text style={styles.currencyName}>{currency.name}</Text>
        <TextInput
          style={styles.input}
          value={tempValue}  
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#aaa"
          textAlign="right"
          onChangeText={(text) => {
            setTempValue(text);  
          }}
          onSubmitEditing={(event) => {
            handleSubmitEditing(currency.code, tempValue); 
          }}
          returnKeyType="done" 
        />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: user?.imageUrl }} style={styles.userImage} />
          <Text style={styles.userName}>{user?.fullName}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View>
          {currencies.map((currency) => (
            <CurrencyInput
              key={currency.code}
              currency={currency}
              value={amounts[currency.code] || ''}
            />
          ))}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD8E6',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#4682B4',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  flag: {
    width: 24,
    height: 16,
    marginLeft: '5%',
    position: 'absolute',
    zIndex: 1,
  },
  currencyName: {
    color: '#fff',
    fontSize: 16,
    marginLeft: '14%',
    position: 'absolute',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    width: '100%',
    padding: 12,
    paddingRight: 18,
    borderRadius: 8,
    borderColor: '#444',
    borderWidth: 1,
    textAlign: 'right',
  },
  convertedValue: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
  },
});
