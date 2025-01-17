import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export default function App() {
  const [change, setChange] = React.useState(0);
  const [expoPushToken, setExpoPushToken] = useState('');
 
  useEffect(() => {
    // Function to request notification permissions
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification Permission Status:', status);  
        
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'You need to enable notifications for this app.');
          return;
        }
        
        // If permissions are granted, fetch the Expo Push Token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        console.log('Project ID:', projectId);

        if (!projectId) {
          throw new Error('No project ID found');
        }

        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId: projectId
        });
        console.log('Expo Push Token Full Response:', tokenResponse);  
        console.log('Expo Push Token Data:', tokenResponse.data);  
        
        // Set the token in state
        setExpoPushToken(tokenResponse.data);
      } catch (error) {
        console.error('Error getting notification token:', error);  
        Alert.alert('Token Error', error.message || 'Could not retrieve notification token');
      }
    };

    // Request permissions and get the token
    requestPermissions();

    // Handle incoming notifications
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    // Cleanup listeners
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [change]);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button
        title="Change the state"
        onPress={() => setChange(change + 1)}
      />
      {expoPushToken ? (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenText}>Expo Push Token:</Text>
          <Text numberOfLines={1} ellipsizeMode="middle">{expoPushToken}</Text>
        </View>
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '90%',
  },
  tokenText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
