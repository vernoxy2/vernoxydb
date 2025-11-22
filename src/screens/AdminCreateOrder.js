import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import CustomLabelTextInput from '../components/CustomLabelTextInput';
import CustomButton from '../components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import CustomDropdown from '../components/CustomDropdown';
import DatePicker from 'react-native-date-picker';
import {
  around,
  blocks,
  labelType,
  options,
  printingPlateSize,
  productData,
  teethSize,
  upsAcross,
  windingDirection,
} from '../constant/constant';
import moment from 'moment';
import {useRoute} from '@react-navigation/native';

const AdminCreateOrder = ({navigation}) => {
  const [poNo, setPoNo] = useState('');
  const [quotationNo, setQuotationNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [jobCardNo, setJobCardNo] = useState('');
  const [jobName, setJobName] = useState('');
  const [jobDate, setJobDate] = useState(new Date());
  const [openJobDate, setOpenJobDate] = useState(false);
  const [jobQty, setJobQty] = useState('');
  const [jobPaper, setJobPaper] = useState('');
  const [accept, setAccept] = useState(false);
  const [productDetail1, setProductDetail1] = useState('');
  const [productDetail2, setProductDetail2] = useState('');
  const [productDetail3, setProductDetail3] = useState('');

  const route = useRoute();
  const {id, isEdit} = route.params || {};

  useEffect(() => {
    if (isEdit && id) {
      fetchOrderDetails();
    } else {
      generateJobCardNo();
    }
  }, [isEdit, id, fetchOrderDetails, generateJobCardNo]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const doc = await firestore().collection('orders').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        // ✅ Text Inputs
        setPoNo(data.poNo || '');
        setQuotationNo(data.quotationNo || '');
        setCustomerName(data.customerName || '');
        setJobCardNo(data.jobCardNo || '');
        setJobName(data.jobName || '');
        setJobDate(data.jobDate?.toDate() || new Date());
        setJobQty(data.jobQty || '');
        setAccept(data.accept || false);
        setJobPaper(data.jobPaper || '');
        setProductDetail1(data.productDetail1 || '');
        setProductDetail2(data.productDetail2 || '');
        setProductDetail3(data.productDetail3 || '');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  }, [id]); // depends only on id

  const generateJobCardNo = useCallback(async () => {
    try {
      const monthPrefix = moment().format('MMM'); // e.g. Nov
      const yearSuffix = moment().format('YY'); // e.g. 25
      const prefix = `${monthPrefix}.${yearSuffix}`; // e.g. Nov.25

      const snapshot = await firestore()
        .collection('orders')
        .where('jobCardNo', '>=', `${prefix}-`)
        .where('jobCardNo', '<=', `${prefix}-\uf8ff`) // ensures prefix match
        .get();

      let maxNumber = 0;

      snapshot.forEach(doc => {
        const jobCardNo = doc.data().jobCardNo;
        if (jobCardNo && jobCardNo.startsWith(prefix)) {
          const parts = jobCardNo.split('-');
          if (parts.length === 2 && !isNaN(parts[1])) {
            const num = parseInt(parts[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });

      const nextNumber = maxNumber + 1;
      const newJobNo = `${prefix}-${String(nextNumber).padStart(2, '0')}`;
      setJobCardNo(newJobNo);
    } catch (err) {
      console.error('Error generating job card number:', err);
    }
  }, []); // no dependencies

  const handleSubmit = async () => {
    let assignedUserUID = '93VDkRLi7KaPya0saoCc4D6VasX2';
    let jobStatus = 'Pending';

    try {
      const orderData = {
        poNo,
        jobDate: firestore.Timestamp.fromDate(jobDate),
        customerName,
        jobCardNo,
        jobName,
        jobQty,
        jobStatus,
        quotationNo,
        assignedTo: assignedUserUID,
        createdBy: 'Admin',
        createdAt: firestore.FieldValue.serverTimestamp(),
        accept: accept,
        productDetail1,
        productDetail2,
        productDetail3,
      };
      if (isEdit && id) {
        // ✅ Keep the old jobStatus instead of overwriting it
        await firestore().collection('orders').doc(id).update(orderData);
        Alert.alert('Success', 'Job updated successfully');
      } else {
        // ✅ Only assign jobStatus when creating a new record
        const exists = await firestore()
          .collection('orders')
          .where('jobCardNo', '==', jobCardNo)
          .get();

        if (!exists.empty) {
          Alert.alert(
            'Duplicate Job Card No',
            'Please generate another number',
          );
          return;
        }

        await firestore()
          .collection('orders')
          .add({
            ...orderData,
            jobStatus, // ✅ assign only when creating
            createdAt: firestore.FieldValue.serverTimestamp(),
            createdBy: 'Admin',
          });
        Alert.alert('Success', 'Job created successfully');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Error', 'Something went wrong. Try again.');
    }
  };

  return (
    <View style={styles.adminFormMainContainer}>
      <CustomHeader
        showHeadingSection1Container={true}
        showBackBtn
        showHeadingTextContainer={true}
        headingTitle={'Flexo Job Card'}
        showHeadingSection2Container
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.adminFormSubContainer}>
          {/* PO No */}
          <View style={styles.inputBackContainer}>
            <Text style={styles.inputLabel}>PO No :</Text>
            <TextInput
              style={styles.inputContainer}
              value={poNo}
              onChangeText={setPoNo}
            />
          </View>
          <View style={styles.inputBackContainer}>
            <Text style={styles.inputLabel}>Quotation No :</Text>
            <TextInput
              style={styles.inputContainer}
              value={quotationNo}
              onChangeText={setQuotationNo}
            />
          </View>
          <View style={styles.inputBackContainer}>
            <Text style={styles.inputLabel}>Job Date:</Text>
            <TouchableOpacity
              onPress={() => setOpenJobDate(true)}
              style={styles.inputContainer}>
              <Text>{jobDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>
          <DatePicker
            modal
            mode="date"
            open={openJobDate}
            date={jobDate}
            minimumDate={new Date()} // No past dates
            onConfirm={date => {
              setOpenJobDate(false);
              setJobDate(date);
            }}
            onCancel={() => setOpenJobDate(false)}
          />

          <CustomLabelTextInput
            label="Customer Name :"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <CustomLabelTextInput
            label="Job Card No :"
            value={jobCardNo}
            // onChangeText={setJobCardNo}
             editable={false}
          />
          <CustomLabelTextInput
            label="Job Name :"
            value={jobName}
            onChangeText={setJobName}
          />
          <CustomLabelTextInput
            label="Job Qty :"
            value={jobQty}
            onChangeText={setJobQty}
          />

          <CustomLabelTextInput
            label="Product Detail1 :"
            value={productDetail1}
            onChangeText={setProductDetail1}
          />

          <CustomLabelTextInput
            label="Product Detail2 :"
            value={productDetail2}
            onChangeText={setProductDetail2}
            keyboardType="numeric"
            numericOnly={true}
          />
          <CustomDropdown
            placeholder={'Product Detail'}
            data={productData}
            style={styles.dropdownContainer}
            selectedText={styles.dropdownText}
            showIcon={true}
            onSelect={item => setProductDetail3(item)}
            value={productDetail3}
          />
          <View style={styles.btnContainer}>
            <CustomButton
              title={isEdit ? 'Update' : 'Submit'}
              style={styles.submitBtn}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminCreateOrder;

const styles = StyleSheet.create({
  adminFormMainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 10,
  },
  adminFormSubContainer: {
    paddingHorizontal: 20,
  },
  inputBackContainer: {
    width: '100%',
    backgroundColor: '#f6f6f6',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    padding: 10,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 8,
    color: '#000',
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Lato-Black',
  },
  submitBtn: {
    marginVertical: 40,
    width: '100%',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '100%',
    borderRadius: 10,
    marginTop: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-start',
    width: 70,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Lato-Black',
    color: '#000',
    marginVertical: 10,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  checked: {
    backgroundColor: '#000',
  },
  checkmarkImage: {
    height: 10,
    width: 10,
    tintColor: '#fff',
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    marginLeft: 10,
  },
});
