import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backendUrl from '../config';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'; // Import PDF related components
import '../Style/StudentRecord.css'; // Import the CSS file for styling

function StudentRecords() {
  const [students, setStudents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedRecord, setEditedRecord] = useState({});
  const [loading, setLoading] = useState(true); // State for loading spinner

  useEffect(() => {
    fetchData(); // Fetch data when component mounts
    setEditMode(false); // Reset edit mode
    setEditedRecord({}); // Reset edited record
  }, []);

  const fetchData = () => {
    setLoading(true); // Show loading spinner while fetching data
    axios.get(`${backendUrl}/api/students`)
      .then(response => {
        setStudents(response.data);
        setLoading(false); // Turn off loading spinner
      })
      .catch(error => console.error('Error fetching student data:', error));
  };

  const handleDelete = (id) => {
    // Delete the student with the given ID from the API
    axios.delete(`${backendUrl}/api/students/${id}`)
      .then(() => {
        setStudents(students.filter((student) => student.id !== id));
        // Show toast notification
        toast.success("Student deleted successfully!");
      })
      .catch(error => console.error('Error deleting student:', error));
  };

  const handleEdit = (student) => {
    setEditedRecord(student);
    setEditMode(true);
  };

  const handleSave = (editedData) => {
    // Remove undefined values from editedData
    const cleanedData = Object.fromEntries(
      Object.entries(editedData).filter(([_, value]) => value !== undefined)
    );
  
    // Update the student data in the API
    axios.put(`${backendUrl}/api/students/${cleanedData.id}`, cleanedData)
      .then(response => {
        if (response.data && response.data.student) { // Check if updated student data exists in response
          setStudents(students.map(student => student.id === response.data.student.id ? response.data.student : student));
          setEditMode(false);
          // Show toast notification for successful update
          toast.success("Student updated successfully", {
            onClose: () => window.location.reload() // Refresh the page after the toast is closed
          });
        } else {
          console.error('Error: Updated student data not found in response:', response.data);
        }
      })
      .then(fetchData) // Call fetchData function after successful edit
      .catch(error => {
        console.error('Error updating student data:', error);
        // Handle error and keep edit mode enabled for the user to retry
      });
  };

  // Function to render the PDF
  const renderPDF = () => (
    <Document>
      <Page size="A4">
        <View>
          <Text>Student Records</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Reg#</Text>
              <Text style={styles.headerCell}>First Name</Text>
              <Text style={styles.headerCell}>Last Name</Text>
              <Text style={styles.headerCell}>Age</Text>
              <Text style={styles.headerCell}>Grade</Text>
            </View>
            {students.map((student) => (
              <View style={styles.tableRow} key={student.id}>
                <Text style={styles.cell}>{student.student_id}</Text>
                <Text style={styles.cell}>{student.first_name}</Text>
                <Text style={styles.cell}>{student.last_name}</Text>
                <Text style={styles.cell}>{student.age}</Text>
                <Text style={styles.cell}>{student.grade}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="student-records-container">
      <h2 className="student-records-header">Student Records</h2>
      {loading ? ( // Show loader if loading is true
        <TailSpin color="#00BFFF" height={80} width={80} />
      ) : (
        <>
          <table className="student-records-table">
            <thead>
              <tr>
                <th>Reg#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Age</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.age}</td>
                  <td>{student.grade}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(student)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(student.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editMode && <EditRecordForm record={editedRecord} onSave={handleSave} />}
        </>
      )}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> {/* Toast container */}
      <PDFDownloadLink document={renderPDF()} fileName="student_records.pdf">
        {({ blob, url, loading, error }) =>
          loading ? 'Loading document...' : 'Download PDF'
        }
      </PDFDownloadLink>
    </div>
  );
}

// Styles for PDF
const styles = StyleSheet.create({
  table: { flexDirection: 'column', width: '100%', marginTop: 10,padding:20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', padding: 10 },
  headerCell: { flex: 1, fontWeight: 'bold' },
  cell: { flex: 1 },
});

function EditRecordForm({ record, onSave }) {
  const [editedRecord, setEditedRecord] = useState(record);

  useEffect(() => {
    setEditedRecord(record);
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRecord({ ...editedRecord, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedRecord);
  };

  return (
    <div className="edit-record-form">
      <h3>Edit Record</h3>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input type="text" name="first_name" value={editedRecord.first_name || ''} onChange={handleChange} />
        </label>
        <label>
          Last Name:
          <input type="text" name="last_name" value={editedRecord.last_name || ''} onChange={handleChange} />
        </label>
        <label>
          Age:
          <input type="number" name="age" value={editedRecord.age || ''} onChange={handleChange} />
        </label>
        <label>
          Grade:
          <input type="text" name="grade" value={editedRecord.grade || ''} onChange={handleChange} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default StudentRecords;
