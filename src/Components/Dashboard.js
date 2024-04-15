// Dashboard.js
import React from 'react';
import StudentRecords from './StudentRecord';
import CSVImport from './CSVImports';
import "../Style/Dashboard.css"

function Dashboard() {
  const handleCSVUpload = (data) => {
    // Handle CSV data received from the CSVImport component
    console.log('CSV Data:', data);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Student Dashboard</h1>
      <div className="csv-import-container">
        <CSVImport handleCSV={handleCSVUpload} />
      </div>
      <div className="student-records-container">
        <StudentRecords />
      </div>
    </div>
  );
}

export default Dashboard;
