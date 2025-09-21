import api from './api';

class RegistrationService {
  // Create new registration
  async createRegistration(eventId, registrationData) {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(registrationData).forEach(key => {
        if (key === 'paymentScreenshot') {
          // Handle file upload
          if (registrationData[key]) {
            formData.append('paymentScreenshot', registrationData[key]);
          }
        } else if (typeof registrationData[key] === 'object' && registrationData[key] !== null) {
          // Handle nested objects
          formData.append(key, JSON.stringify(registrationData[key]));
        } else {
          formData.append(key, registrationData[key]);
        }
      });
      
      const response = await api.post(`/registrations/event/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's registrations
  async getUserRegistrations(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/registrations?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single registration by ID
  async getRegistrationById(registrationId) {
    try {
      const response = await api.get(`/registrations/${registrationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update registration
  async updateRegistration(registrationId, updateData) {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(updateData).forEach(key => {
        if (key === 'paymentScreenshot') {
          // Handle file upload
          if (updateData[key]) {
            formData.append('paymentScreenshot', updateData[key]);
          }
        } else if (typeof updateData[key] === 'object' && updateData[key] !== null) {
          // Handle nested objects
          formData.append(key, JSON.stringify(updateData[key]));
        } else {
          formData.append(key, updateData[key]);
        }
      });
      
      const response = await api.put(`/registrations/${registrationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel registration
  async cancelRegistration(registrationId) {
    try {
      const response = await api.delete(`/registrations/${registrationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user registration statistics
  async getUserRegistrationStats() {
    try {
      const response = await api.get('/registrations/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get registration status color
  getStatusColor(status) {
    const colors = {
      submitted: 'reg-status-submitted',
      under_review: 'reg-status-submitted',
      approved: 'reg-status-approved',
      rejected: 'reg-status-rejected',
      cancelled: 'reg-status-cancelled'
    };
    return colors[status] || 'reg-status-submitted';
  }

  // Get registration status display text
  getStatusText(status) {
    const texts = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };
    return texts[status] || 'Unknown';
  }

  // Check if registration can be edited
  canEditRegistration(registration) {
    return registration.status === 'submitted';
  }

  // Check if registration can be cancelled
  canCancelRegistration(registration) {
    if (!registration.event) return false;
    
    const now = new Date();
    const eventStart = new Date(registration.event.startDate);
    
    return (
      registration.status === 'approved' && 
      eventStart > now
    );
  }

  // Validate registration data
  validateRegistrationData(data, eventRequirements) {
    const errors = {};

    // Basic validations
    if (!data.registrationType) {
      errors.registrationType = 'Registration type is required';
    }

    if (!data.contactDetails?.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactDetails.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.contactDetails?.primaryPhone) {
      errors.primaryPhone = 'Primary phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(data.contactDetails.primaryPhone)) {
      errors.primaryPhone = 'Invalid Indian phone number';
    }

    if (!data.academicDetails?.college) {
      errors.college = 'College is required';
    }

    if (!data.academicDetails?.department) {
      errors.department = 'Department is required';
    }

    if (!data.academicDetails?.year) {
      errors.year = 'Academic year is required';
    }

    if (!data.location?.city) {
      errors.city = 'City is required';
    }

    if (!data.paymentDetails?.amount || data.paymentDetails.amount < 0) {
      errors.amount = 'Valid payment amount is required';
    }

    if (!data.paymentScreenshot) {
      errors.paymentScreenshot = 'Payment screenshot is required';
    }

    // Team-specific validations
    if (data.registrationType === 'team') {
      if (!data.teamName || data.teamName.trim() === '') {
        errors.teamName = 'Team name is required for team registration';
      }

      if (!data.teamMembers || data.teamMembers.length === 0) {
        errors.teamMembers = 'Team members are required';
      } else {
        // Validate team size constraints
        if (eventRequirements?.teamSize) {
          const { min, max } = eventRequirements.teamSize;
          if (data.teamMembers.length < min) {
            errors.teamMembers = `Minimum ${min} team members required`;
          } else if (data.teamMembers.length > max) {
            errors.teamMembers = `Maximum ${max} team members allowed`;
          }
        }

        // Validate each team member
        data.teamMembers.forEach((member, index) => {
          if (!member.name || member.name.trim() === '') {
            errors[`teamMember${index}Name`] = `Team member ${index + 1} name is required`;
          }
        });
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format registration date
  formatRegistrationDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Generate registration summary for display
  generateRegistrationSummary(registration) {
    const summary = {
      basicInfo: {
        registrationNumber: registration.registrationNumber,
        registrationType: registration.registrationType,
        status: registration.status,
        submittedAt: this.formatRegistrationDate(registration.submittedAt)
      },
      contactInfo: registration.contactDetails,
      academicInfo: registration.academicDetails,
      locationInfo: registration.location,
      paymentInfo: {
        amount: registration.paymentDetails.amount,
        transactionId: registration.paymentDetails.transactionId,
        status: registration.paymentDetails.paymentStatus
      }
    };

    // Add team info if applicable
    if (registration.registrationType === 'team') {
      summary.teamInfo = {
        teamName: registration.teamName,
        memberCount: registration.teamMembers?.length || 0,
        members: registration.teamMembers || []
      };
    }

    return summary;
  }

  // Download registration receipt/confirmation
  async downloadRegistrationReceipt(registrationId) {
    try {
      const response = await api.get(`/registrations/${registrationId}/receipt`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registration-${registrationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download receipt error:', error);
      return false;
    }
  }

  // Share registration to WhatsApp
  shareRegistrationWhatsApp(registration) {
    const message = `🎫 Event Registration Confirmed!\n\n📋 Registration: ${registration.registrationNumber}\n🎪 Event: ${registration.event?.name}\n📅 Date: ${registration.event?.startDate ? new Date(registration.event.startDate).toLocaleDateString() : 'TBD'}\n📍 Venue: ${registration.event?.venue || 'TBD'}\n\n✅ Status: ${this.getStatusText(registration.status)}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
}

export default new RegistrationService();
