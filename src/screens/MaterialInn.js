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

const MaterialInn = ({navigation}) => {
  const [paperCode, setPaperCode] = useState('');
  const [runningMeter, setRunningMeter] = useState('');
  const [roll, setRoll] = useState('');
  const [totalRunningMeter, setTotalRunningMeter] = useState('');
  const [jobDate, setJobDate] = useState(new Date());
  const [openJobDate, setOpenJobDate] = useState(false);
  const [materialType, setMaterialType] = useState('');

  const companyNameList = [
    {label: 'Company A', value: 'Company A'},
    {label: 'Company B', value: 'Company B'},
    {label: 'Company C', value: 'Company C'},
  ];

  const route = useRoute();
  const {id, isEdit} = route.params || {};

  const handleSubmit = async () => {
    let assignedUserUID = '93VDkRLi7KaPya0saoCc4D6VasX2';
    let jobStatus = 'Pending';
  };

  return (
    <View style={styles.adminFormMainContainer}>
      <CustomHeader
        showHeadingSection1Container={true}
        showBackBtn
        showHeadingTextContainer={true}
        headingTitle={'Material Detail'}
        showHeadingSection2Container
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.adminFormSubContainer}>
          {/* Date Picker */}
          <View style={styles.inputBackContainer}>
            <Text style={styles.inputLabel}>Date:</Text>
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
            minimumDate={new Date()}
            onConfirm={date => {
              setOpenJobDate(false);
              setJobDate(date);
            }}
            onCancel={() => setOpenJobDate(false)}
          />

          {/* Company Name Dropdown */}
          <CustomDropdown
            placeholder="Select Company"
            data={companyNameList} // ⬅️ You will provide this list
            style={styles.dropdownContainer}
            selectedText={styles.dropdownText}
            showIcon={true}
          />

          {/* Material Type */}
          <CustomLabelTextInput
            label="Material Type :"
            value={materialType}
            onChangeText={setMaterialType}
          />

          {/* Paper Code – Auto Generated Later */}
          <CustomLabelTextInput
            label="Paper Code :"
            value={paperCode}
            editable={false} // auto-generated later
          />

          {/* Running Meter */}
          <CustomLabelTextInput
            label="Running Meter :"
            value={runningMeter}
            keyboardType="numeric"
            onChangeText={text => {
              setRunningMeter(text);

              // Auto update total meter
              const total = Number(text) * Number(roll);
              setTotalRunningMeter(total.toString());
            }}
          />

          {/* Roll */}
          <CustomLabelTextInput
            label="Roll :"
            value={roll}
            keyboardType="numeric"
            onChangeText={text => {
              setRoll(text);

              // Auto update total meter
              const total = Number(runningMeter) * Number(text);
              setTotalRunningMeter(total.toString());
            }}
          />

          {/* Total Running Meter (Read Only) */}
          <CustomLabelTextInput
            label="Total Running Meter :"
            value={totalRunningMeter}
            editable={false}
          />

          {/* Submit */}
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

export default MaterialInn;

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
