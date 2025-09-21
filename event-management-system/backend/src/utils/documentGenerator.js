const officegen = require('officegen');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Generate Word document for registrations
const generateWordDocument = (registrations, eventName) => {
  return new Promise((resolve, reject) => {
    try {
      const docx = officegen('docx');
      
      // Document properties
      docx.setDocTitle(`${eventName} - Registration Details`);
      docx.setDocSubject('Event Registration Report');
      docx.setDocKeywords('event, registration, kongu college');

      // Add title
      const title = docx.createP();
      title.addText(`${eventName} - Registration Details`, {
        font_size: 18,
        bold: true,
        color: '000080'
      });
      title.addLineBreak();
      title.addText(`Generated on: ${new Date().toLocaleDateString()}`, {
        font_size: 12,
        color: '666666'
      });

      docx.createP().addLineBreak();

      registrations.forEach((registration, index) => {
        // Registration header
        const header = docx.createP();
        header.addText(`Registration ${index + 1}`, {
          font_size: 16,
          bold: true,
          color: '000080'
        });
        header.addLineBreak();

        // Basic information
        const basicInfo = docx.createP();
        basicInfo.addText('Basic Information:', { bold: true });
        basicInfo.addLineBreak();
        basicInfo.addText(`Registration Number: ${registration.registrationNumber}`);
        basicInfo.addLineBreak();
        basicInfo.addText(`Registration Type: ${registration.registrationType.toUpperCase()}`);
        basicInfo.addLineBreak();
        basicInfo.addText(`Status: ${registration.status.toUpperCase()}`);
        basicInfo.addLineBreak();
        basicInfo.addText(`Submitted: ${new Date(registration.submittedAt).toLocaleDateString()}`);
        basicInfo.addLineBreak();

        // Team information (if applicable)
        if (registration.registrationType === 'team' && registration.teamName) {
          const teamInfo = docx.createP();
          teamInfo.addText('Team Information:', { bold: true });
          teamInfo.addLineBreak();
          teamInfo.addText(`Team Name: ${registration.teamName}`);
          teamInfo.addLineBreak();
          
          if (registration.teamMembers && registration.teamMembers.length > 0) {
            teamInfo.addText('Team Members:');
            teamInfo.addLineBreak();
            registration.teamMembers.forEach((member, idx) => {
              teamInfo.addText(`${idx + 1}. ${member.name} - ${member.email || 'N/A'}`);
              teamInfo.addLineBreak();
            });
          }
          teamInfo.addLineBreak();
        }

        // Contact details
        const contactInfo = docx.createP();
        contactInfo.addText('Contact Information:', { bold: true });
        contactInfo.addLineBreak();
        contactInfo.addText(`Email: ${registration.contactDetails.email}`);
        contactInfo.addLineBreak();
        contactInfo.addText(`Phone: ${registration.contactDetails.primaryPhone}`);
        contactInfo.addLineBreak();
        if (registration.contactDetails.alternatePhone) {
          contactInfo.addText(`Alternate Phone: ${registration.contactDetails.alternatePhone}`);
          contactInfo.addLineBreak();
        }

        // Academic details
        const academicInfo = docx.createP();
        academicInfo.addText('Academic Information:', { bold: true });
        academicInfo.addLineBreak();
        academicInfo.addText(`College: ${registration.academicDetails.college}`);
        academicInfo.addLineBreak();
        academicInfo.addText(`Department: ${registration.academicDetails.department}`);
        academicInfo.addLineBreak();
        academicInfo.addText(`Year: ${registration.academicDetails.year}`);
        academicInfo.addLineBreak();
        if (registration.academicDetails.rollNumber) {
          academicInfo.addText(`Roll Number: ${registration.academicDetails.rollNumber}`);
          academicInfo.addLineBreak();
        }

        // Payment information
        const paymentInfo = docx.createP();
        paymentInfo.addText('Payment Information:', { bold: true });
        paymentInfo.addLineBreak();
        paymentInfo.addText(`Amount: ₹${registration.paymentDetails.amount}`);
        paymentInfo.addLineBreak();
        paymentInfo.addText(`Status: ${registration.paymentDetails.paymentStatus.toUpperCase()}`);
        paymentInfo.addLineBreak();
        if (registration.paymentDetails.transactionId) {
          paymentInfo.addText(`Transaction ID: ${registration.paymentDetails.transactionId}`);
          paymentInfo.addLineBreak();
        }

        // Add separator between registrations
        if (index < registrations.length - 1) {
          docx.createP().addText('_'.repeat(50), { color: 'CCCCCC' });
          docx.createP().addLineBreak();
        }
      });

      // Generate the document
      const fileName = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_${Date.now()}.docx`;
      const filePath = path.join(__dirname, '../../temp', fileName);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const out = fs.createWriteStream(filePath);
      
      docx.generate(out);
      
      out.on('close', () => {
        resolve({ fileName, filePath });
      });
      
      out.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Generate Excel spreadsheet for registrations
const generateExcelSpreadsheet = (registrations, eventName) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = registrations.map((registration, index) => {
      const baseData = {
        'S.No': index + 1,
        'Registration Number': registration.registrationNumber,
        'Registration Type': registration.registrationType.toUpperCase(),
        'Status': registration.status.toUpperCase(),
        'Team Name': registration.teamName || 'N/A',
        'Primary Contact Name': registration.user?.name || 'N/A',
        'Email': registration.contactDetails.email,
        'Phone': registration.contactDetails.primaryPhone,
        'Alternate Phone': registration.contactDetails.alternatePhone || 'N/A',
        'College': registration.academicDetails.college,
        'Department': registration.academicDetails.department,
        'Year': registration.academicDetails.year,
        'Roll Number': registration.academicDetails.rollNumber || 'N/A',
        'City': registration.location.city,
        'State': registration.location.state || 'N/A',
        'Payment Amount': `₹${registration.paymentDetails.amount}`,
        'Payment Status': registration.paymentDetails.paymentStatus.toUpperCase(),
        'Transaction ID': registration.paymentDetails.transactionId || 'N/A',
        'Submitted Date': new Date(registration.submittedAt).toLocaleDateString(),
        'Special Requirements': registration.specialRequirements || 'None'
      };

      // Add team members if it's a team registration
      if (registration.registrationType === 'team' && registration.teamMembers) {
        registration.teamMembers.forEach((member, idx) => {
          baseData[`Team Member ${idx + 1} Name`] = member.name;
          baseData[`Team Member ${idx + 1} Email`] = member.email || 'N/A';
          baseData[`Team Member ${idx + 1} Phone`] = member.phone || 'N/A';
        });
      }

      return baseData;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = [
      { wch: 5 },  // S.No
      { wch: 20 }, // Registration Number
      { wch: 15 }, // Registration Type
      { wch: 12 }, // Status
      { wch: 20 }, // Team Name
      { wch: 25 }, // Primary Contact Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Alternate Phone
      { wch: 25 }, // College
      { wch: 20 }, // Department
      { wch: 10 }, // Year
      { wch: 15 }, // Roll Number
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 12 }, // Payment Amount
      { wch: 15 }, // Payment Status
      { wch: 20 }, // Transaction ID
      { wch: 15 }, // Submitted Date
      { wch: 30 }  // Special Requirements
    ];
    
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate file
    const fileName = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, '../../temp', fileName);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    XLSX.writeFile(workbook, filePath);
    
    return { fileName, filePath };
  } catch (error) {
    throw error;
  }
};

// Clean up temporary files
const cleanupTempFiles = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

module.exports = {
  generateWordDocument,
  generateExcelSpreadsheet,
  cleanupTempFiles
};
