const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { validationResult } = require('express-validator');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all events with filtering and pagination
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      search,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
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

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add registration count and user registration status for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ['submitted', 'approved'] }
        });

        let userRegistered = false;
        if (req.user) {
          const userRegistration = await Registration.findOne({
            event: event._id,
            user: req.user._id
          });
          userRegistered = !!userRegistration;
        }

        return {
          ...event,
          registrationCount,
          userRegistered,
          isRegistrationOpen: new Date() <= event.registrationDeadline && event.status === 'upcoming',
          isFull: event.maxParticipants ? registrationCount >= event.maxParticipants : false
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
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get registration count
    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: { $in: ['submitted', 'approved'] }
    });

    // Check if current user is registered
    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        user: req.user._id
      });
    }

    const eventWithStats = {
      ...event,
      registrationCount,
      userRegistered: !!userRegistration,
      userRegistration: userRegistration,
      isRegistrationOpen: new Date() <= event.registrationDeadline && event.status === 'upcoming',
      isFull: event.maxParticipants ? registrationCount >= event.maxParticipants : false,
      spotsRemaining: event.maxParticipants ? event.maxParticipants - registrationCount : null
    };

    res.status(200).json({
      success: true,
      data: { event: eventWithStats }
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Get events by status (upcoming, ongoing, completed)
const getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!['upcoming', 'ongoing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: upcoming, ongoing, completed'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find({ 
      status, 
      isActive: true 
    })
      .sort({ startDate: status === 'upcoming' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    // Get total count
    const totalEvents = await Event.countDocuments({ status, isActive: true });
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add registration stats
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ['submitted', 'approved'] }
        });

        let userRegistered = false;
        if (req.user) {
          const userRegistration = await Registration.findOne({
            event: event._id,
            user: req.user._id
          });
          userRegistered = !!userRegistration;
        }

        return {
          ...event,
          registrationCount,
          userRegistered,
          isRegistrationOpen: new Date() <= event.registrationDeadline && event.status === 'upcoming',
          isFull: event.maxParticipants ? registrationCount >= event.maxParticipants : false
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
    console.error('Get events by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get events by department
const getEventsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filter = { 
      department: { $regex: new RegExp(department, 'i') }, 
      isActive: true 
    };

    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add registration stats
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ['submitted', 'approved'] }
        });

        let userRegistered = false;
        if (req.user) {
          const userRegistration = await Registration.findOne({
            event: event._id,
            user: req.user._id
          });
          userRegistered = !!userRegistration;
        }

        return {
          ...event,
          registrationCount,
          userRegistered,
          isRegistrationOpen: new Date() <= event.registrationDeadline && event.status === 'upcoming',
          isFull: event.maxParticipants ? registrationCount >= event.maxParticipants : false
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
    console.error('Get events by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get user's registered events
const getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Build registration filter
    const registrationFilter = { user: userId };
    if (status !== 'all') {
      registrationFilter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user registrations with populated event data
    const registrations = await Registration.find(registrationFilter)
      .populate({
        path: 'event',
        match: { isActive: true },
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out registrations where event was not found (deleted events)
    const validRegistrations = registrations.filter(reg => reg.event);

    const totalRegistrations = await Registration.countDocuments(registrationFilter);
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
    console.error('Get user registered events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registered events',
      error: error.message
    });
  }
};

// Search events
const searchEvents = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, department, status } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search filter
    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { venue: { $regex: q.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(q.trim(), 'i')] } }
      ]
    };

    if (department && department !== 'all') {
      filter.department = department;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    // Add registration stats
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: { $in: ['submitted', 'approved'] }
        });

        let userRegistered = false;
        if (req.user) {
          const userRegistration = await Registration.findOne({
            event: event._id,
            user: req.user._id
          });
          userRegistered = !!userRegistration;
        }

        return {
          ...event,
          registrationCount,
          userRegistered,
          isRegistrationOpen: new Date() <= event.registrationDeadline && event.status === 'upcoming',
          isFull: event.maxParticipants ? registrationCount >= event.maxParticipants : false
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        events: eventsWithStats,
        searchQuery: q,
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
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search events',
      error: error.message
    });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get registration statistics
    const totalRegistrations = await Registration.countDocuments({ event: id });
    const approvedRegistrations = await Registration.countDocuments({ 
      event: id, 
      status: 'approved' 
    });
    const pendingRegistrations = await Registration.countDocuments({ 
      event: id, 
      status: 'submitted' 
    });
    const rejectedRegistrations = await Registration.countDocuments({ 
      event: id, 
      status: 'rejected' 
    });

    // Get registration type breakdown
    const individualRegistrations = await Registration.countDocuments({ 
      event: id, 
      registrationType: 'individual' 
    });
    const teamRegistrations = await Registration.countDocuments({ 
      event: id, 
      registrationType: 'team' 
    });

    // Get department-wise registration breakdown
    const departmentStats = await Registration.aggregate([
      { $match: { event: event._id } },
      { $group: { 
        _id: '$academicDetails.department', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } }
    ]);

    // Get college-wise registration breakdown
    const collegeStats = await Registration.aggregate([
      { $match: { event: event._id } },
      { $group: { 
        _id: '$academicDetails.college', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const stats = {
      eventId: id,
      eventName: event.name,
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
      rejectedRegistrations,
      individualRegistrations,
      teamRegistrations,
      departmentBreakdown: departmentStats,
      collegeBreakdown: collegeStats,
      maxParticipants: event.maxParticipants,
      spotsRemaining: event.maxParticipants ? event.maxParticipants - approvedRegistrations : null,
      registrationRate: event.maxParticipants ? ((approvedRegistrations / event.maxParticipants) * 100).toFixed(2) : null
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getEventsByStatus,
  getEventsByDepartment,
  getUserRegisteredEvents,
  searchEvents,
  getEventStats
};
