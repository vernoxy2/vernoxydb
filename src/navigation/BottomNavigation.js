import React, {useContext} from 'react';
import {Image, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AdminJobDetailsScreen from '../screens/AdminJobDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminCreateOrder from '../screens/AdminCreateOrder';
import homeIcon from '../assets/images/homeBottomImg.png';
import profileIcon from '../assets/images/profileBottomImg.png';
import NotificationIcon from '../assets/images/notificationBottomImg.png';
import NotificationScreen from '../screens/NotificationScreen';
import User1HomeScreen from '../screens/User1HomeScreen';
import User1JobDetailScreen from '../screens/User1JobDetailScreen';

import {NotificationContext} from '../context/NotificationContext'; // ✅ ADD THIS

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminHome" component={HomeScreen} />
    <Stack.Screen name="AdminJobDetails" component={AdminJobDetailsScreen} />
    <Stack.Screen name="AdminCreateOrder" component={AdminCreateOrder} />
  </Stack.Navigator>
);

const userStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="User1HomeScreen" component={User1HomeScreen} />
    <Stack.Screen
      name="User1JobDetailScreen"
      component={User1JobDetailScreen}
    />
  </Stack.Navigator>
);

const BottomNavigation = ({route}) => {
  const role = route?.params?.role ?? 'Admin';

  const {hasNew} = useContext(NotificationContext); // ✅ READ GLOBAL BADGE STATE

  const HomeComponent =
    role === 'Admin' ? AdminStack : role === 'user' ? userStack : AdminStack;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let icon;
          if (route.name === 'Home') icon = homeIcon;
          else if (route.name === 'Profile') icon = profileIcon;
          else if (route.name === 'Notifications') icon = NotificationIcon;

          return (
            <View>
              {/* MAIN ICON */}
              <Image
                source={icon}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? '#007bff' : 'gray',
                }}
                resizeMode="contain"
              />

              {/* 🔴 BADGE DOT (ONLY FOR NOTIFICATIONS TAB) */}
              {route.name === 'Notifications' && hasNew && (
                <View
                  style={{
                    position: 'absolute',
                    right: -2,
                    top: -2,
                    width: 10,
                    height: 10,
                    backgroundColor: 'red',
                    borderRadius: 5,
                  }}
                />
              )}
            </View>
          );
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeComponent} />

      {/* Notifications only for user */}
      {role === 'user' && (
        <Tab.Screen name="Notifications" component={NotificationScreen} />
      )}

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
