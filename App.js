// import React from "react";
// import SplashScreen from "./src/screens/SplashScreen";
// import LoginScreen from "./src/screens/LoginScreen";
// import StackNavigation from "./src/navigation/StackNavigation";


// const App = ()=> {
//   return (
//     <>
//     <StackNavigation/>
//     </>
//   )
// }
// export default App

import React, { useEffect } from "react";
import { Alert } from "react-native";
import StackNavigation from "./src/navigation/StackNavigation";
import { firebase } from "@react-native-firebase/app"; // ✅ FIXED import
import { NotificationProvider } from "./src/context/NotificationContext";

const App = () => {
  useEffect(() => {
    try {
      const config = firebase.app().options; // ✅ FIXED usage
       } catch (error) {
      console.error("Error reading Firebase config:", error);
      Alert.alert("Error", error.message);
    }
  }, []);

  // return <StackNavigation />;
    return (
    <NotificationProvider>   {/* ✅ WRAP HERE */}
      <StackNavigation />
    </NotificationProvider>
  );
};

export default App;

