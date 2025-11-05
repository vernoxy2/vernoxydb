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
import app from "@react-native-firebase/app";

const App = () => {
  useEffect(() => {
    const config = app().options;
    console.log("🔥 Firebase Config:", config);
    Alert.alert("Firebase Project ID", config.projectId || "No projectId found");
  }, []);

  return <StackNavigation />;
};

export default App;
