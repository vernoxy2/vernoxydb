import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from '../components/CustomHeader';
import SearchBar from '../components/SearchBar';
import DatePicker from 'react-native-date-picker';
import { NotificationContext } from '../context/NotificationContext';

const User1HomeScreen = ({navigation}) => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('allJobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const { setHasNew } = useContext(NotificationContext);

  useEffect(() => {
  // listen for orders and mark badge if any unaccepted exist
  const unsubscribe = firestore()
    .collection('orders')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const fetchedJobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // count unaccepted jobs (only for user role, if you later set role in this screen)
        const unacceptedCount = fetchedJobs.filter(j => j.accept === false).length;

        setHasNew(unacceptedCount > 0);
      },
      error => {
        console.error('Error listening for badge jobs: ', error);
      }
    );

  return () => unsubscribe();
}, [setHasNew]);


  useEffect(() => {
    const unsubscribe = firestore()
      .collection('orders')
      .orderBy('createdAt', 'desc') // ✅ Sort newest first
      .onSnapshot(
        snapshot => {
          const fetchedJobs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setJobData(fetchedJobs);
          setLoading(false);
        },
        error => {
          console.error('Error fetching jobs: ', error);
          setLoading(false);
        },
      );
    return () => unsubscribe();
  }, []);

  const getFilteredJobs = () => {
    let filtered = jobData;

    if (filter !== 'allJobs') {
      filtered = filtered.filter(
        job =>
          job.jobStatus?.toLowerCase() ===
          filter.replace('Jobs', '').toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          (job.jobCardNo && job.jobCardNo.toLowerCase().includes(query)) ||
          (job.customerName &&
            job.customerName.toLowerCase().includes(query)) ||
          (() => {
            if (!job.jobDate) return false;
            let jobDateObj;

            if (job.jobDate.toDate) {
              jobDateObj = job.jobDate.toDate();
            } else if (job.jobDate._seconds) {
              jobDateObj = new Date(job.jobDate._seconds * 1000);
            } else if (typeof job.jobDate === 'string') {
              jobDateObj = new Date(job.jobDate);
            } else {
              jobDateObj = job.jobDate;
            }

            return jobDateObj.toDateString().toLowerCase().includes(query);
          })(),
      );
    }

     if (fromDate || toDate) {
      filtered = filtered.filter(job => {
        let jobDate;

        if (job.jobDate?.toDate) {
          jobDate = job.jobDate.toDate();
        } else if (job.jobDate?._seconds) {
          jobDate = new Date(job.jobDate._seconds * 1000);
        } else if (typeof job.jobDate === 'string') {
          jobDate = new Date(job.jobDate);
        } else {
          jobDate = job.jobDate;
        }

        if (!(jobDate instanceof Date) || isNaN(jobDate)) return false;

        // Normalize jobDate (set to 00:00:00)
        const normalizedJobDate = new Date(
          jobDate.getFullYear(),
          jobDate.getMonth(),
          jobDate.getDate(),
        );

        // Normalize fromDate
        const normalizedFrom = fromDate
          ? new Date(
              fromDate.getFullYear(),
              fromDate.getMonth(),
              fromDate.getDate(),
            )
          : null;

        // Normalize toDate
        const normalizedTo = toDate
          ? new Date(
              toDate.getFullYear(),
              toDate.getMonth(),
              toDate.getDate(),
              23,
              59,
              59,
              999,
            )
          : null;

        if (normalizedFrom && normalizedJobDate < normalizedFrom) return false;
        if (normalizedTo && normalizedJobDate > normalizedTo) return false;

        return true;
      });
    }

    // ✅ Only accepted jobs
    filtered = filtered.filter(job => job.accept === true);

    // ❌ Exclude completed jobs
    filtered = filtered.filter(
      job => job.jobStatus?.toLowerCase() !== 'completed',
    );
    return filtered;
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.header]}>
      <Text style={styles.cellHeading}>Job Card No</Text>
      <Text style={styles.cellHeading}>Job Name</Text>
      <Text style={styles.cellHeading}>Date</Text>
      <Text style={styles.cellHeading}>Status</Text>
    </View>
  );

  const renderItem = ({item}) => (
    <Pressable
      onPress={() => {
        navigation.navigate('User1JobDetailScreen', {order: item});
      }}
      style={styles.row}>
      <Text style={styles.cell}>{item.jobCardNo}</Text>
      <Text style={styles.cell}>{item.jobName}</Text>
      <Text style={styles.cell}>
        {item.jobDate
          ? item.jobDate.toDate
            ? item.jobDate.toDate().toDateString()
            : new Date(item.jobDate._seconds * 1000).toDateString()
          : ''}
      </Text>
      <Text
        style={[
          styles.statusCell,
          item.jobStatus?.toLowerCase() === 'completed'
            ? styles.completedStatus
            : item.jobStatus?.toLowerCase() === 'started'
            ? styles.jobStartedStatus
            : styles.pendingStatus,
        ]}>
        {item.jobStatus?.toLowerCase() === 'completed'
          ? 'Completed'
          : item.jobStatus?.toLowerCase() === 'started'
          ? 'Started'
          : 'Pending'}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.homeMainContainer}>
          <CustomHeader
            showHeadingSection1Container={true}
            showHeadingTextContainer={true}
            headingTitle={'User Dashboard'}
            showHeadingSection2Container={true}
            btnHeading={'Create New'}
            showHeaderDropDown={true}
            onDropdownSelect={value => setFilter(value)}
          />
          <View style={styles.homeSubContainer}>
            <SearchBar
              placeholder="Search Job"
              style={styles.searchBarHome}
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />

            <View style={styles.dateFilterContainer}>
              <Pressable
                onPress={() => setOpenFrom(true)}
                style={styles.dateFilterButton}>
                <Text style={styles.dateFilterText}>
                  {fromDate ? fromDate.toDateString() : 'From Date'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOpenTo(true)}
                style={styles.dateFilterButton}>
                <Text style={styles.dateFilterText}>
                  {toDate ? toDate.toDateString() : 'To Date'}
                </Text>
              </Pressable>
            </View>

            <DatePicker
              modal
              open={openFrom}
              date={fromDate || new Date()}
              mode="date"
              maximumDate={new Date()}
              onConfirm={date => {
                setOpenFrom(false);
                setFromDate(date);
              }}
              onCancel={() => setOpenFrom(false)}
            />

            <DatePicker
              modal
              open={openTo}
              date={toDate || new Date()}
              mode="date"
              maximumDate={new Date()}
              minimumDate={fromDate || undefined} // optional: restrict to after fromDate
              onConfirm={date => {
                setOpenTo(false);
                setToDate(date);
              }}
              onCancel={() => setOpenTo(false)}
            />

            <View style={styles.tableHeadingTypesContainer}>
              <Text style={styles.tableHeadingTypesText}>All Jobs</Text>
            </View>
            <View>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{marginTop: 20}}
                />
              ) : getFilteredJobs().length > 0 ? (
                <View style={styles.tableContainer}>
                  {renderHeader()}
                  <FlatList
                    data={getFilteredJobs()}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{paddingBottom: 20}}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    persistentScrollbar={true}
                  />
                </View>
              ) : (
                <View style={styles.noJobsContainer}>
                  <Image
                    source={require('../assets/images/listing.png')}
                    style={styles.noJobsImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.noJobsTitle}>No Jobs Available</Text>
                  {/* <Text style={styles.noJobsSubtitle}>
                    You're all caught up! {'\n'}No such jobs are available.
                  </Text> */}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default User1HomeScreen;

const styles = StyleSheet.create({
  // Your existing styles
  homeMainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarHome: {
    backgroundColor: '#f6f6f6',
  },
  homeSubContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tableHeadingTypesContainer: {
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 20,
    justifyContent: 'center',
  },
  tableHeadingTypesText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Lato-Regular',
  },
  tableContainer: {
    // flex: 1,
    maxHeight: 340,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 20,
    display: 'flex',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    backgroundColor: '#125D9F',
  },
  cellHeading: {
    width: 80,
    textAlign: 'center',
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Lato-Black',
  },
  cell: {
    width: 80,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
  },
  statusCell: {
    width: 80,
    textAlign: 'center',
    color: '#ff0000',
    fontSize: 12,
    fontFamily: 'Lato-Bold',
  },
  completedStatus: {
    color: 'green',
  },
  pendingStatus: {
    color: 'red',
  },
  jobStartedStatus: {
    color: '#3668B1',
  },
  noJobsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },

  noJobsImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.8,
  },

  noJobsTitle: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#333',
    marginBottom: 8,
  },

  noJobsSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginVertical: 10,
  },
  dateFilterButton: {
    width: '45%',
    padding: 10,
    backgroundColor: '#f6f6f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  dateFilterText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Lato-Regular',
  },
});
