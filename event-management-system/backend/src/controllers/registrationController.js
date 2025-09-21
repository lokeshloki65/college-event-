const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Create new registration
const createRegistration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.canRegister()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not open for this event'
      });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: userId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    const currentRegistrations = await Registration.countDocuments({
      event: eventId,
      status: { $in: ['submitted', 'approved'] }
    });

    if (event.maxParticipants && currentRegistrations >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full. Registration closed.'
      });
    }

    const {
      registrationType,
      teamName,
      teamMembers,
      contactDetails,
      academicDetails,
      location,
      paymentDetails,
      customFields,
      specialRequirements,
      emergencyContact
    } = req.body;

    // Validate registration type
    if (!['individual', 'team'].includes(registrationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration type'
      });
    }

    // Validate team registration
    if (registrationType === 'team') {
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Team name is required for team registration'
        });
      }

      if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Team members are required for team registration'
        });
      }

      // Check team size constraints
      if (event.teamSize) {
        if (teamMembers.length < event.teamSize.min) {
          return res.status(400).json({
            success: false,
            message: `Minimum team size is ${event.teamSize.min} members`
          });
        }
        if (teamMembers.length > event.teamSize.max) {
          return res.status(400).json({
            success: false,
            message: `Maximum team size is ${event.teamSize.max} members`
          });
        }
      }
    }

    // Handle payment screenshot upload
    let paymentScreenshot = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: 'kongu-events/payment-screenshots',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
          ]
        });
        
        paymentScreenshot = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Payment screenshot upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload payment screenshot'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required'
      });
    }

    // Create registration
    const registrationData = {
      event: eventId,
      user: userId,
      registrationType,
      contactDetails,
      academicDetails,
      location,
      paymentDetails: {
        ...paymentDetails,
        paymentScreenshot
      },
      specialRequirements,
      emergencyContact
    };

    // Add team-specific data if applicable
    if (registrationType === 'team') {
      registrationData.teamName = teamName;
      registrationData.teamMembers = teamMembers;
    }

    // Add custom fields if provided
    if (customFields && typeof customFields === 'object') {
      registrationData.customFields = new Map(Object.entries(customFields));
    }

    const registration = new Registration(registrationData);
    await registration.save();

    // Update event registration count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { totalRegistrations: 1 }
    });

    // Add event to user's registered events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { registeredEvents: eventId }
    });

    // Populate the registration for response
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event', 'name startDate venue')
      .populate('user', 'name email');

    // Emit real-time event for new registration
    if (req.io) {
      req.io.emit('registration-created', {
        eventId: eventId,
        registrationId: registration._id,
        registrationType: registration.registrationType,
        teamName: registration.teamName,
        userName: req.user.name,
        timestamp: new Date()
      });

      // Notify admins about new registration
      req.io.to('admin').emit('new-registration-notification', {
        eventId: eventId,
        eventName: event.name,
        registrationId: registration._id,
        registrationNumber: registration.registrationNumber,
        userName: req.user.name,
        registrationType: registration.registrationType,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: { registration: populatedRegistration }
    });

  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create registration',
      error: error.message
    });
  }
};

// Get user's registrations
const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, eventStatus } = req.query;

    // Build filter
    const filter = { user: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get registrations with populated event data
    const registrations = await Registration.find(filter)
      .populate({
        path: 'event',
        match: eventStatus && eventStatus !== 'all' ? { status: eventStatus } : {},
        select: 'name description startDate endDate venue status posterImage department registrationFee'
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out registrations where event doesn't match the eventStatus filter
    const validRegistrations = registrations.filter(reg => reg.event);

    const totalRegistrations = await Registration.countDocuments(filter);
    const totalPages = Math.ceil(totalRegistrations / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        registrations: validRegistrations,
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
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};

// Get single registration by ID
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      _id: id,
      user: userId
    })
      .populate('event', 'name description startDate endDate venue status posterImage department registrationFee whatsappGroupLink')
      .populate('user', 'name email phone')
      .lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { registration }
    });

  } catch (error) {
    console.error('Get registration by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration',
      error: error.message
    });
  }
};

// Update registration (limited fields)
const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      _id: id,
      user: userId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if registration can be updated
    if (registration.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Registration cannot be updated after review'
      });
    }

    const {
      contactDetails,
      location,
      specialRequirements,
      emergencyContact,
      customFields
    } = req.body;

    // Update allowed fields
    if (contactDetails) {
      registration.contactDetails = { ...registration.contactDetails, ...contactDetails };
    }
    if (location) {
      registration.location = { ...registration.location, ...location };
    }
    if (specialRequirements !== undefined) {
      registration.specialRequirements = specialRequirements;
    }
    if (emergencyContact) {
      registration.emergencyContact = { ...registration.emergencyContact, ...emergencyContact };
    }
    if (customFields && typeof customFields === 'object') {
      registration.customFields = new Map(Object.entries(customFields));
    }

    // Handle payment screenshot update if provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: 'kongu-events/payment-screenshots',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
          ]
        });
        
        registration.paymentDetails.paymentScreenshot = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Payment screenshot upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload new payment screenshot'
        });
      }
    }

    await registration.save();

    // Populate for response
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event', 'name startDate venue')
      .populate('user', 'name email');

    // Emit real-time event for registration update
    if (req.io) {
      req.io.emit('registration-updated', {
        eventId: registration.event,
        registrationId: registration._id,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: { registration: populatedRegistration }
    });

  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration',
      error: error.message
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      _id: id,
      user: userId
    }).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if registration can be cancelled
    if (!registration.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Registration cannot be cancelled at this time'
      });
    }

    // Update registration status
    registration.status = 'cancelled';
    await registration.save();

    // Update event registration count
    await Event.findByIdAndUpdate(registration.event._id, {
      $inc: { totalRegistrations: -1 }
    });

    // Remove event from user's registered events
    await User.findByIdAndUpdate(userId, {
      $pull: { registeredEvents: registration.event._id }
    });

    // Emit real-time event for registration cancellation
    if (req.io) {
      req.io.emit('registration-cancelled', {
        eventId: registration.event._id,
        registrationId: registration._id,
        userName: req.user.name,
        timestamp: new Date()
      });

      // Notify admins
      req.io.to('admin').emit('registration-cancelled-notification', {
        eventId: registration.event._id,
        eventName: registration.event.name,
        registrationId: registration._id,
        registrationNumber: registration.registrationNumber,
        userName: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
};

// Get registration statistics for a user
const getUserRegistrationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Registration.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRegistrations = await Registration.countDocuments({ user: userId });
    const upcomingEvents = await Registration.countDocuments({
      user: userId,
      status: { $in: ['submitted', 'approved'] }
    });

    // Get upcoming events with populated event data
    const upcomingRegistrations = await Registration.find({
      user: userId,
      status: { $in: ['submitted', 'approved'] }
    })
      .populate({
        path: 'event',
        match: { status: 'upcoming' },
        select: 'name startDate venue'
      })
      .limit(5);

    const validUpcomingRegistrations = upcomingRegistrations.filter(reg => reg.event);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalRegistrations,
        upcomingEvents,
        recentUpcomingEvents: validUpcomingRegistrations
      }
    });

  } catch (error) {
    console.error('Get user registration stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration statistics',
      error: error.message
    });
  }
};

module.exports = {
  createRegistration,
  getUserRegistrations,
  getRegistrationById,
  updateRegistration,
  cancelRegistration,
  getUserRegistrationStats
};
