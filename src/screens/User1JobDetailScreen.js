import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from '../components/CustomHeader';
import CustomDropdown from '../components/CustomDropdown';
import {format, set} from 'date-fns';
import auth from '@react-native-firebase/auth';
import {detail2List, detail4List} from '../constant/constant';

const User1JobDetailScreen = ({route, navigation}) => {
  const {order} = route.params;
  const isCompleted = order.jobStatus === 'completed';

  const [isJobStart, setIsJobStart] = useState(order.isJobStart || false);
  const [detail1, setDetail1] = useState('');
  const [detail2, setDetail2] = useState('');
  const [detail3, setDetail3] = useState('');
  const [detail4, setDetail4] = useState('');

  const handleJobComplete = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const jobRef = firestore().collection('orders').doc(order.id);

      await jobRef.update({
        jobStatus: 'completed',
        updatedJobByAt: firestore.FieldValue.serverTimestamp(),
        // assignedTo: 'sDdHMFBdkrhF90pwSk0g1ALcct33', // ✅ now it's OK to hand off to slitting operator
        jobCompletedBy: currentUser.uid,
        detail3: detail3,
        detail4: detail4,
      });

      Alert.alert('Success', 'Job marked as completed');

      navigation.goBack();
    } catch (error) {
      console.error('Error completing job:', error);
      Alert.alert('Error', 'Failed to complete job');
    }
  };

  const handleJobStart = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const jobRef = firestore().collection('orders').doc(order.id);

      await jobRef.update({
        jobstartBy: currentUser.uid,
        jobStartAt: firestore.FieldValue.serverTimestamp(),
        isJobStart: true,
        jobStatus: 'started',
        detail1: detail1,
        detail2: detail2,
      });

      Alert.alert('Success', 'Job started');
      navigation.navigate('User1HomeScreen');

      // navigation.goBack();
    } catch (error) {
      console.error('Error Job start:', error);
      Alert.alert('Error', 'Failed to start Job');
    }
  };
  return (
    <View style={styles.container}>
      <CustomHeader
        showHeadingSection1Container
        showBackBtn
        showHeadingTextContainer
        headingTitle="Job Details"
      />

      {!isJobStart ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.label}>PO No:</Text>
            <Text style={styles.value}>{order.poNo}</Text>

            <Text style={styles.label}>Quotation No:</Text>
            <Text style={styles.value}>{order.quotationNo}</Text>

            <Text style={styles.label}>Job Date:</Text>
            <Text style={styles.value}>
              {order.jobDate ? order.jobDate.toDate().toDateString() : 'N/A'}
            </Text>
            <Text style={styles.label}>Customer Name:</Text>
            <Text style={styles.value}>{order.customerName}</Text>

            <Text style={styles.label}>Job Card No:</Text>
            <Text style={styles.value}>{order.jobCardNo}</Text>

            <Text style={styles.label}>Job Name:</Text>
            <Text style={styles.value}>{order.jobName}</Text>

            <Text style={styles.label}>Job Qty:</Text>
            <Text style={styles.value}>{order.jobQty}</Text>

            <Text style={styles.label}>Product Detail1:</Text>
            <Text style={styles.value}>{order.productDetail1.label}</Text>

            <Text style={styles.label}>Product Detail2:</Text>
            <Text style={styles.value}>{order.productDetail2.label}</Text>

            <Text style={styles.label}>Product Detail3:</Text>
            <Text style={styles.value}>{order.productDetail3.label}</Text>

            <TextInput
              placeholderTextColor="#999"
              style={styles.input}
              value={detail1}
              onChangeText={setDetail1}
              placeholder="Enter Detail1"
              // keyboardType="numeric"
            />
            <CustomDropdown
              placeholder={'Select Detail2'}
              data={detail2List}
              style={styles.dropdownContainer}
              selectedText={styles.dropdownText}
              onSelect={item => setDetail2(item)}
              showIcon={true}
              value={detail2}
            />
          </ScrollView>
          {!isCompleted && (
            <View style={styles.buttonContainer}>
              <Button
                title="Job Start"
                onPress={handleJobStart}
                color="#4CAF50"
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.homeSubContainer}>
          <Text style={styles.label}>Job Card No:</Text>
          <Text style={styles.value}>{order.jobCardNo}</Text>

           <Text style={styles.label}>Job Name:</Text>
            <Text style={styles.value}>{order.jobName}</Text>

          <Text style={styles.label}>Detail3:</Text>
          <TextInput
            style={styles.input}
            value={detail3}
            onChangeText={setDetail3}
            placeholder="Enter Detail3"
            // keyboardType="numeric"
          />
          <CustomDropdown
            placeholder={'Select Detail4'}
            data={detail4List}
            style={styles.dropdownContainer}
            selectedText={styles.dropdownText}
            onSelect={item => setDetail4(item)}
            showIcon={true}
            value={detail4}
          />

          {!isCompleted && (
            <View style={styles.buttonContainer}>
              <Button
                title="Job Complete"
                onPress={handleJobComplete}
                color="#4CAF50"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default User1JobDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontFamily: 'Lato-Black',
    fontSize: 16,
    marginTop: 15,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    fontFamily: 'Lato-Regular',
    marginVertical: 5,
  },
  dropdownContainer: {
    width: '100%',
    borderRadius: 10,
    marginTop: 20,

    height: 40,
    justifyContent: 'space-between',

    paddingHorizontal: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  readOnlyField: {
    marginTop: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
  },
  homeSubContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
