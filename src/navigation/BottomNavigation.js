import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AdminJobDetailsScreen from '../screens/AdminJobDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminCreateOrder from '../screens/AdminCreateOrder';
import homeIcon from '../assets/images/homeBottomImg.png';
import profileIcon from '../assets/images/profileBottomImg.png';
import NotificationScreen from '../screens/NotificationScreen';
import User1HomeScreen from '../screens/User1HomeScreen';
import User1JobDetailScreen from '../screens/User1JobDetailScreen';

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

  // Select correct stack based on user role
  const HomeComponent =
    role === 'Admin' ? AdminStack : role === 'user' ? userStack : AdminStack;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let icon;
          if (route.name === 'Home') icon = homeIcon;
          else if (route.name === 'Profile') icon = profileIcon;

          return (
            <Image
              source={icon}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#007bff' : 'gray',
              }}
              resizeMode="contain"
            />
          );
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeComponent} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigation;
