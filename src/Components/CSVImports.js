import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Style/CSVImport.css';
import backendUrl from '../config';

function CSVImport({ handleCSV }) {
  const [errorMessage, setErrorMessage] = useState(null); // State for error message

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setErrorMessage('Please select a CSV file to upload.');
      return;
    }

    const file = acceptedFiles[0];

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('csvFile', file);

      // Make POST request with FormData and Content-Type header
      const response = await axios.post(`${backendUrl}/api/csv/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle successful response
      console.log('CSV data imported:', response.data);
      setErrorMessage(null); // Clear any previous error message
      handleCSV(response.data);
      toast.success('CSV file uploaded successfully!');

      // Refresh the browser page
      window.location.reload();
    } catch (error) {
      // Handle error
      console.error('Error importing CSV:', error);
      setErrorMessage('An error occurred while uploading the CSV file.'); // Set error message
    }
  };

  return (
    <div className="csv-import-container">
      <Dropzone onDrop={onDrop} accept=".csv">
        {({ getRootProps, getInputProps }) => (
          <section className="dropzone">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button className="upload-btn">Upload CSV File</button>
            </div>
          </section>
        )}
      </Dropzone>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default CSVImport;
