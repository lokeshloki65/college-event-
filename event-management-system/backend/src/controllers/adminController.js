const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { generateWordDocument, generateExcelSpreadsheet, cleanupTempFiles } = require('../utils/documentGenerator');
const fs = require('fs');

// Create new event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      department,
      college,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFee,
      paymentDetails,
      instructions,
      registrationType,
      teamSize,
      customFields,
      whatsappGroupLink,
      tags
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const regDeadline = new Date(registrationDeadline);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (regDeadline >= start) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline must be before event start date'
      });
    }

    if (regDeadline <= now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline must be in the future'
      });
    }

    // Handle file uploads
    let posterImage = null;
    let paymentQR = null;

    const files = req.files;
    if (!files || !files.poster) {
      return res.status(400).json({
        success: false,
        message: 'Event poster is required'
      });
    }

    try {
      // Upload poster image
      const posterUploadResult = await uploadToCloudinary(files.poster[0].buffer, {
        folder: 'kongu-events/posters',
        transformation: [
          { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' }
        ]
      });
      
      posterImage = {
        public_id: posterUploadResult.public_id,
        url: posterUploadResult.url
      };

      // Upload payment QR if provided
      if (files.paymentQR && files.paymentQR[0]) {
        const qrUploadResult = await uploadToCloudinary(files.paymentQR[0].buffer, {
          folder: 'kongu-events/payment-qr',
          transformation: [
            { width: 400, height: 400, crop: 'fit', quality: 'auto:good' }
          ]
        });
        
        paymentQR = {
          public_id: qrUploadResult.public_id,
          url: qrUploadResult.url
        };
      }

    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(400).json({
        success: false,
        message: 'Failed to upload images'
      });
    }

    // Create event
    const eventData = {
      name,
      description,
      department,
      college: college || 'Kongu Engineering College',
      posterImage,
      startDate: start,
      endDate: end,
      registrationDeadline: regDeadline,
      venue,
      maxParticipants: maxParticipants || null,
      registrationFee: registrationFee || 0,
      paymentQR,
      paymentDetails: paymentDetails || {},
      instructions,
      registrationType: registrationType || 'individual',
      teamSize: teamSize || { min: 1, max: 1 },
      customFields: customFields || [],
      whatsappGroupLink,
      tags: tags || [],
      createdBy: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    // Populate creator details
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    // Emit real-time event for new event creation
    if (req.io) {
      req.io.emit('event-created', {
        eventId: event._id,
        eventName: event.name,
        department: event.department,
        startDate: event.startDate,
        createdBy: req.user.name,
        timestamp: new Date()
      });

      // Notify all users about new event
      req.io.to('student').emit('new-event-notification', {
        eventId: event._id,
        eventName: event.name,
        department: event.department,
        startDate: event.startDate,
        registrationDeadline: event.registrationDeadline,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: populatedEvent }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update existing event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const {
      name,
      description,
      department,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFee,
      paymentDetails,
      instructions,
      registrationType,
      teamSize,
      customFields,
      whatsappGroupLink,
      tags,
      status
    } = req.body;

    // Validate dates if provided
    if (startDate || endDate || registrationDeadline) {
      const start = startDate ? new Date(startDate) : event.startDate;
      const end = endDate ? new Date(endDate) : event.endDate;
      const regDeadline = registrationDeadline ? new Date(registrationDeadline) : event.registrationDeadline;

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      if (regDeadline >= start) {
        return res.status(400).json({
          success: false,
          message: 'Registration deadline must be before event start date'
        });
      }
    }

    // Handle file uploads if provided
    const files = req.files;
    
    if (files && files.poster && files.poster[0]) {
      try {
        // Delete old poster if exists
        if (event.posterImage && event.posterImage.public_id) {
          await deleteFromCloudinary(event.posterImage.public_id);
        }

        // Upload new poster
        const posterUploadResult = await uploadToCloudinary(files.poster[0].buffer, {
          folder: 'kongu-events/posters',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' }
          ]
        });
        
        event.posterImage = {
          public_id: posterUploadResult.public_id,
          url: posterUploadResult.url
        };
      } catch (uploadError) {
        console.error('Poster upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload poster image'
        });
      }
    }

    if (files && files.paymentQR && files.paymentQR[0]) {
      try {
        // Delete old payment QR if exists
        if (event.paymentQR && event.paymentQR.public_id) {
          await deleteFromCloudinary(event.paymentQR.public_id);
        }

        // Upload new payment QR
        const qrUploadResult = await uploadToCloudinary(files.paymentQR[0].buffer, {
          folder: 'kongu-events/payment-qr',
          transformation: [
            { width: 400, height: 400, crop: 'fit', quality: 'auto:good' }
          ]
        });
        
        event.paymentQR = {
          public_id: qrUploadResult.public_id,
          url: qrUploadResult.url
        };
      } catch (uploadError) {
        console.error('Payment QR upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload payment QR image'
        });
      }
    }

    // Update fields
    if (name) event.name = name;
    if (description) event.description = description;
    if (department) event.department = department;
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
    if (venue) event.venue = venue;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants || null;
    if (registrationFee !== undefined) event.registrationFee = registrationFee;
    if (paymentDetails) event.paymentDetails = { ...event.paymentDetails, ...paymentDetails };
    if (instructions !== undefined) event.instructions = instructions;
    if (registrationType) event.registrationType = registrationType;
    if (teamSize) event.teamSize = teamSize;
    if (customFields) event.customFields = customFields;
    if (whatsappGroupLink !== undefined) event.whatsappGroupLink = whatsappGroupLink;
    if (tags) event.tags = tags;
    if (status) event.status = status;

    await event.save();

    // Populate creator details
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    // Emit real-time event for event update
    if (req.io) {
      req.io.emit('event-updated', {
        eventId: event._id,
        eventName: event.name,
        updatedBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: populatedEvent }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event (soft delete)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has registrations
    const registrationCount = await Registration.countDocuments({ event: id });
    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations. Please cancel all registrations first.'
      });
    }

    // Soft delete
    event.isActive = false;
    await event.save();

    // Emit real-time event for event deletion
    if (req.io) {
      req.io.emit('event-deleted', {
        eventId: event._id,
        eventName: event.name,
        deletedBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Get all events (admin view with additional details)
const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (department && department !== 'all') {
      filter.department = department;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add registration statistics for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationStats = await Registration.aggregate([
          { $match: { event: event._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const totalRegistrations = await Registration.countDocuments({ event: event._id });

        return {
          ...event,
          registrationStats,
          totalRegistrations,
          spotsRemaining: event.maxParticipants ? event.maxParticipants - totalRegistrations : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        events: eventsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get event registrations (admin view)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      registrationType,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build filter
    const filter = { event: eventId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (registrationType && registrationType !== 'all') {
      filter.registrationType = registrationType;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const registrations = await Registration.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email phone college department year')
      .populate('event', 'name startDate venue')
      .lean();

    const totalRegistrations = await Registration.countDocuments(filter);
    const totalPages = Math.ceil(totalRegistrations / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          venue: event.venue
        },
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRegistrations,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    });
  }
};

// Update registration status (approve/reject)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: approved, rejected, under_review'
      });
    }

    const registration = await Registration.findById(registrationId)
      .populate('event', 'name')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Update registration
    registration.status = status;
    registration.adminNotes = adminNotes || '';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();

    await registration.save();

    // Emit real-time event for status update
    if (req.io) {
      req.io.emit('registration-status-updated', {
        registrationId: registration._id,
        eventId: registration.event._id,
        userId: registration.user._id,
        status,
        reviewedBy: req.user.name,
        timestamp: new Date()
      });

      // Notify the user about status change
      req.io.to(`student-${registration.user._id}`).emit('registration-status-notification', {
        registrationId: registration._id,
        registrationNumber: registration.registrationNumber,
        eventName: registration.event.name,
        status,
        adminNotes,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Registration ${status} successfully`,
      data: { registration }
    });

  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status',
      error: error.message
    });
  }
};

// Export event registrations
const exportEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { format = 'excel', status = 'all' } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build filter for registrations
    const filter = { event: eventId };
    if (status !== 'all') {
      filter.status = status;
    }

    // Get all registrations for the event
    const registrations = await Registration.find(filter)
      .populate('user', 'name email phone college department year')
      .populate('event', 'name startDate venue')
      .sort({ submittedAt: -1 })
      .lean();

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registrations found for this event'
      });
    }

    let filePath, fileName;

    if (format === 'word') {
      // Generate Word document
      const result = await generateWordDocument(registrations, event.name);
      filePath = result.filePath;
      fileName = result.fileName;
    } else {
      // Generate Excel spreadsheet (default)
      const result = generateExcelSpreadsheet(registrations, event.name);
      filePath = result.filePath;
      fileName = result.fileName;
    }

    // Set appropriate headers for file download
    const contentType = format === 'word' ? 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send file and cleanup
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
      // Clean up temporary file
      cleanupTempFiles(filePath);
    });

  } catch (error) {
    console.error('Export registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export registrations',
      error: error.message
    });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get event statistics
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming', isActive: true });
    const ongoingEvents = await Event.countDocuments({ status: 'ongoing', isActive: true });
    const completedEvents = await Event.countDocuments({ status: 'completed', isActive: true });

    // Get registration statistics
    const totalRegistrations = await Registration.countDocuments();
    const pendingRegistrations = await Registration.countDocuments({ status: 'submitted' });
    const approvedRegistrations = await Registration.countDocuments({ status: 'approved' });
    const rejectedRegistrations = await Registration.countDocuments({ status: 'rejected' });

    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'student', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    // Get recent activity
    const recentEvents = await Event.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .select('name department startDate createdAt createdBy');

    const recentRegistrations = await Registration.find()
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('event', 'name')
      .select('registrationNumber user event status submittedAt');

    // Get department-wise event breakdown
    const departmentStats = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await Registration.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        ongoing: ongoingEvents,
        completed: completedEvents
      },
      registrations: {
        total: totalRegistrations,
        pending: pendingRegistrations,
        approved: approvedRegistrations,
        rejected: rejectedRegistrations
      },
      users: {
        total: totalUsers,
        admins: totalAdmins
      },
      recentActivity: {
        events: recentEvents,
        registrations: recentRegistrations
      },
      analytics: {
        departmentBreakdown: departmentStats,
        monthlyTrends: monthlyRegistrations
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get all users (admin view)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      department,
      college,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (department && department !== 'all') {
      filter.department = { $regex: department, $options: 'i' };
    }
    if (college && college !== 'all') {
      filter.college = { $regex: college, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Add registration count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const registrationCount = await Registration.countDocuments({ user: user._id });
        return { ...user, registrationCount };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventRegistrations,
  updateRegistrationStatus,
  exportEventRegistrations,
  getDashboardStats,
  getAllUsers
};
