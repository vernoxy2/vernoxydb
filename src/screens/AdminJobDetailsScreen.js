import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from '../components/CustomHeader';
import {format} from 'date-fns';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {PermissionsAndroid, Platform, Button} from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';

const AdminJobDetailsScreen = ({route, navigation}) => {
  const {order} = route.params;
  const [totalTime, setTotalTime] = useState(null);

  useEffect(() => {
    if (order.updatedJobByAt && order.jobStartAt) {
      const start = order.jobStartAt.toDate();
      const end = order.updatedJobByAt.toDate();

      const durationMs = end - start;
      setTotalTime(durationMs);
    }
  }, [order]);

  const formatTimestamp = timestamp => {
    if (!timestamp) return 'Not started yet';
    return format(timestamp.toDate(), 'dd MMM yyyy, hh:mm a'); // Convert Firestore Timestamp to JS Date and format
  };

  const formatDuration = durationMs => {
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const sdkVersion = Platform.constants?.Release || 0;

      if (parseInt(sdkVersion) >= 13) {
        // No need to ask for WRITE_EXTERNAL_STORAGE on Android 13+
        return true;
      }

      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save PDF files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    } else {
      return true;
    }
  };

  const generatePDF = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission not granted');
        return;
      }
      // 🧮 Pre-calculate formatted values (your existing logic)
      const jobCreationTime = order.createdAt
        ? formatTimestamp(order.createdAt)
        : '';
      const startTimeFormatted = order.jobStartAt
        ? formatTimestamp(order.jobStartAt)
        : '';
      const endTimeFormatted = order.updatedJobByAt
        ? formatTimestamp(order.updatedJobByAt)
        : '';
      const totalTimeFormatted =
        totalTime !== null ? formatDuration(totalTime) : '';

      const jobDateFormatted = order.jobDate
        ? order.jobDate.toDate().toLocaleDateString()
        : '';

      const htmlContent = `
      <html>
      <head>
          <style>
          body { font-family: Arial, sans-serif; margin-top: 60px; }
          h1 { text-align: center; color: #125D9F; }
          .section { border: 2px solid #125D9F; border-radius: 8px; margin-bottom: 18px; padding: 10px 15px; }
          .section-title { background: #125D9F; color: #fff; font-weight: bold; padding: 3px 10px; border-radius: 5px; display: inline-block; margin-bottom: 10px; }
          .row { display: flex; flex-wrap: wrap; margin-bottom: 8px; }
          .col { flex: 1; min-width: 180px; margin-right: 10px; }
          .label { font-weight: bold; }
          .input { display: inline-block; min-width: 120px; } /* 🧹 removed underline */
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #125D9F; padding: 4px 8px; text-align: center; }
          .small-table td { min-width: 40px; }
          .color-seq-table { margin-bottom: 15px; }
          .time-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              flex-wrap: nowrap;
            }
            .time-row .col {
              flex: 0 0 auto;  /* Prevent wrapping */
              white-space: nowrap;
            }
            .time-row .col:last-child {
              margin-left: auto; /* Push total time to right */
            }
        </style>

      </head>
      <body>    
 <h1>Report</h1> 
        <div class="section">

          <div class="section-title">Admin</div>
          <div class="row">
                <div class="col"><span class="label">PO No.:</span> <span class="input">${
                  order.poNo || ''
                }</span></div>
                <div class="col"><span class="label">Job Date:</span> <span class="input">${jobDateFormatted}</span></div>
          </div>
          <div class="row">
                <div class="col"><span class="label">Customer Name:</span> <span class="input">${
                  order.customerName || ''
                }</span></div>
                  <div class="col"><span class="label">Quotation No:</span> <span class="input">${
                    order.quotationNo || ''
                  }</span></div>
              
          </div>
          <div class="row">
                <div class="col"><span class="label">Job Card no:</span> <span class="input">${
                  order.jobCardNo || ''
                }</span></div>
                <div class="col"><span class="label">Job Name:</span> <span class="input">${
                  order.jobName || ''
                }</span></div>
          </div>
          <div class="row">              
              <div class="col"><span class="label">Job Qty:</span> <span class="input">${
                order.jobQty || ''
              }</span></div>
              <div class="col"><span class="label">Product Detail 1:</span> <span class="input">${
                order.productDetail1 || ''
              }</span></div>
           </div>  
         
           <div class="row">              
             <div class="col"><span class="label">Product Detail 2:</span> <span class="input">${
               order.productDetail2 || ''
             }</span></div> 
               <div class="col"><span class="label">Product Detail 3:</span> <span class="input">${
                 order.productDetail3?.label || ''
               }</span></div> 
          </div>     
            <div class="row">
               <div class="col"><span class="label">Job Creation Time:</span> <span class="input">${jobCreationTime}</span></div> 
               <div class="col"><span class="label">Start time:</span> <span class="input">${startTimeFormatted}</span></div> 
          </div>     
            <div class="row">
            <div class="col"><span class="label">End time:</span> <span class="input">${endTimeFormatted}</span></div>
            <div class="col"><span class="label">Total time:</span> <span class="input">${totalTimeFormatted}</span></div>
          </div>
              </div>  
        </div>       

        <div class="section">
          <div class="section-title">User</div>
          <div class="row">
            <div class="col"><span class="label">Job Start Time:</span> <span class="input">${
              startTimeFormatted || ''
            }</span></div>
            <div class="col"><span class="label">Job End Time:</span> <span class="input">${
              endTimeFormatted || ''
            }</span></div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Detail1:</span> <span class="input">${
              order.detail1 || ''
            }</span></div>
            <div class="col"><span class="label">Detail2:</span> <span class="input">${
              order.detail2?.label || ''
            }</span></div>
            </div>
             <div class="row">
            <div class="col"><span class="label">Detail3:</span> <span class="input">${
              order.detail3 || ''
            }</span></div>
            <div class="col"><span class="label">Detail4:</span> <span class="input">${
              order.detail4?.label || ''
            }</span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

      // 🧹 Safe filename logic
      const rawJobCardNo = order.jobCardNo || 'Unknown';
      const safeJobCardNo = rawJobCardNo
        .toString()
        .replace(/[^a-zA-Z0-9_-]/g, '') // remove special characters
        .slice(0, 20); // limit length to 20 chars

      const fileName = `Job_Details_${safeJobCardNo}`;

      const path = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
      // const path = `${RNFS.DocumentDirectoryPath}/Job_Details_${order.jobCardNo}.pdf`;

      const options = {
        html: htmlContent,
        fileName: `Job_Details_${order.jobCardNo}`,
        filePath: path, // manually specify full path
        base64: false,
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `PDF saved to: ${file.filePath}`);
      // After PDF generation
      const filePath = file.filePath;

      Share.open({
        title: 'Open PDF',
        url: `file://${filePath}`,
        type: 'application/pdf',
      })
        .then(() => console.log('Share opened'))
        .catch(err => {
          console.error('Share error:', err);
          Alert.alert('Error', 'Unable to share the PDF file.');
        });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const savePDF = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission not granted');
        return;
      }

      // 🧮 Pre-calculate formatted values (your existing logic)
      const jobCreationTime = order.createdAt
        ? formatTimestamp(order.createdAt)
        : '';
      const startTimeFormatted = order.jobStartAt
        ? formatTimestamp(order.jobStartAt)
        : '';
      const endTimeFormatted = order.updatedJobByAt
        ? formatTimestamp(order.updatedJobByAt)
        : '';
      const totalTimeFormatted =
        totalTime !== null ? formatDuration(totalTime) : '';

      const jobDateFormatted = order.jobDate
        ? order.jobDate.toDate().toLocaleDateString()
        : '';

      const htmlContent = `
      <html>
      <head>
          <style>
           body { font-family: Arial, sans-serif; margin-top: 60px; }
          h1 { text-align: center; color: #125D9F; }
          .section { border: 2px solid #125D9F; border-radius: 8px; margin-bottom: 18px; padding: 10px 15px; }
          .section-title { background: #125D9F; color: #fff; font-weight: bold; padding: 3px 10px; border-radius: 5px; display: inline-block; margin-bottom: 10px; }
          .row { display: flex; flex-wrap: wrap; margin-bottom: 8px; }
          .col { flex: 1; min-width: 180px; margin-right: 10px; }
          .label { font-weight: bold; }
          .input { display: inline-block; min-width: 120px; } /* 🧹 removed underline */
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #125D9F; padding: 4px 8px; text-align: center; }
          .small-table td { min-width: 40px; }
          .color-seq-table { margin-bottom: 15px; }
          .time-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              flex-wrap: nowrap;
            }
            .time-row .col {
              flex: 0 0 auto;  /* Prevent wrapping */
              white-space: nowrap;
            }
            .time-row .col:last-child {
              margin-left: auto; /* Push total time to right */
            }
        </style>

      </head>
      <body>    
 <h1>Report</h1> 
        <div class="section">

          <div class="section-title">Admin</div>
          <div class="row">
                <div class="col"><span class="label">PO No.:</span> <span class="input">${
                  order.poNo || ''
                }</span></div>
                <div class="col"><span class="label">Job Date:</span> <span class="input">${jobDateFormatted}</span></div>
          </div>
          <div class="row">
                <div class="col"><span class="label">Customer Name:</span> <span class="input">${
                  order.customerName || ''
                }</span></div>
                  <div class="col"><span class="label">Quotation No:</span> <span class="input">${
                    order.quotationNo || ''
                  }</span></div>
              
          </div>
          <div class="row">
                <div class="col"><span class="label">Job Card no:</span> <span class="input">${
                  order.jobCardNo || ''
                }</span></div>
                <div class="col"><span class="label">Job Name:</span> <span class="input">${
                  order.jobName || ''
                }</span></div>
          </div>
          <div class="row">              
              <div class="col"><span class="label">Job Qty:</span> <span class="input">${
                order.jobQty || ''
              }</span></div>
              <div class="col"><span class="label">Product Detail 1:</span> <span class="input">${
                order.productDetail1 || ''
              }</span></div>
           </div>  
         
           <div class="row">              
             <div class="col"><span class="label">Product Detail 2:</span> <span class="input">${
               order.productDetail2 || ''
             }</span></div> 
               <div class="col"><span class="label">Product Detail 3:</span> <span class="input">${
                 order.productDetail3?.label || ''
               }</span></div> 
          </div>     
            <div class="row">
               <div class="col"><span class="label">Job Creation Time:</span> <span class="input">${jobCreationTime}</span></div> 
               <div class="col"><span class="label">Start time:</span> <span class="input">${startTimeFormatted}</span></div> 
          </div>     
            <div class="row">
            <div class="col"><span class="label">End time:</span> <span class="input">${endTimeFormatted}</span></div>
            <div class="col"><span class="label">Total time:</span> <span class="input">${totalTimeFormatted}</span></div>
          </div>
              </div>  
        </div>       

        <div class="section">
          <div class="section-title">User</div>
          <div class="row">
            <div class="col"><span class="label">Job Start Time:</span> <span class="input">${
              startTimeFormatted || ''
            }</span></div>
            <div class="col"><span class="label">Job End Time:</span> <span class="input">${
              endTimeFormatted || ''
            }</span></div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Detail1:</span> <span class="input">${
              order.detail1 || ''
            }</span></div>
            <div class="col"><span class="label">Detail2:</span> <span class="input">${
              order.detail2?.label || ''
            }</span></div>
            </div>
             <div class="row">
            <div class="col"><span class="label">Detail3:</span> <span class="input">${
              order.detail3 || ''
            }</span></div>
            <div class="col"><span class="label">Detail4:</span> <span class="input">${
              order.detail4?.label || ''
            }</span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

      // 🕒 Short timestamp: "hmm" (e.g. 937 → 9:37)
      const now = new Date();
      const shortStamp = `${now.getHours()}${now.getMinutes()}`;

      const cleanCustomerName = (order.customerName || 'Customer')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 10);
      // 🧹 Clean job name and job card number for filename
      const cleanJobName = (order.jobName || 'Job')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 12); // limit for readability

      const cleanJobCardNo = (order.jobCardNo || '0000')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 8);

      // 🏷️ Final short & meaningful filename
      // const fileName = `${cleanJobName}_${cleanJobCardNo}_${shortStamp}`;
      const fileName = `JobDetails_${cleanCustomerName}_${cleanJobName}_${cleanJobCardNo}_${shortStamp}`;

      const privatePath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
      const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;

      // 🧾 Generate and copy PDF
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName,
        filePath: privatePath,
        base64: false,
      });

      await RNFS.copyFile(file.filePath, downloadsPath);

      Alert.alert('Success', `PDF saved to Downloads:\n${downloadsPath}`);
      console.log('✅ PDF saved:', downloadsPath);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate or save PDF');
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showHeadingSection1Container={true}
        showBackBtn={true}
        showHeadingTextContainer={true}
        headingTitle={'Job Details'}
        showHeadingSection2Container
      />
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

        <Text style={styles.label}>Job Status:</Text>
        <Text style={styles.value}>{order.jobStatus}</Text>

        <Text style={styles.label}>Job Qty:</Text>
        <Text style={styles.value}>{order.jobQty}</Text>

        <Text style={styles.label}>Product Detail1:</Text>
        <Text style={styles.value}>{order.productDetail1}</Text>

        <Text style={styles.label}>Product Detail2:</Text>
        <Text style={styles.value}>{order.productDetail2}</Text>

        <Text style={styles.label}>Product Detail3:</Text>
        <Text style={styles.value}>{order.productDetail3?.label || ''}</Text>

        <Text style={styles.label}>Detail1:</Text>
        <Text style={styles.value}>{order.detail1 || ''}</Text>

        <Text style={styles.label}>Detail2:</Text>
        <Text style={styles.value}>{order.detail2?.label || ''}</Text>

        <Text style={styles.label}>Detail3:</Text>
        <Text style={styles.value}>{order.detail3 || ''}</Text>

        <Text style={styles.label}>Detail4:</Text>
        <Text style={styles.value}>{order.detail4?.label || ''}</Text>

        <Text style={styles.label}>Start Time:</Text>
        <Text style={styles.value}>
          {order.jobStartAt
            ? formatTimestamp(order.jobStartAt)
            : 'Not started yet'}
        </Text>

        <Text style={styles.label}>End Time:</Text>
        <Text style={styles.value}>
          {order.updatedJobByAt
            ? formatTimestamp(order.updatedJobByAt)
            : 'Not finished yet'}
        </Text>

        <Text style={styles.label}>Total Time:</Text>
        <Text style={styles.value}>
          {totalTime !== null ? formatDuration(totalTime) : 'Calculating...'}
        </Text>

        <View style={{marginVertical: 20}}>
          <Button title="Share PDF" onPress={generatePDF} />
        </View>

        <View style={{marginVertical: 20}}>
          <Button title="Download PDF" onPress={savePDF} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    // fontWeight: 'bold',
    fontSize: 16,
    marginTop: 15,
    color: '#000',
    fontFamily: 'Lato-Black',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    fontFamily: 'Lato-Regular',
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: 'Lato-Black',
    textAlign: 'center',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#444',
    fontFamily: 'Lato-Regular',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#125D9F',
    marginVertical: 5,
    borderRadius: 5,
  },
  summaryLabel: {
    fontFamily: 'Lato-Black',
    fontSize: 16,
    color: '#fff',
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Black',
  },
});

export default AdminJobDetailsScreen;
