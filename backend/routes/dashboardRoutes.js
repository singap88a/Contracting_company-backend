const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ServiceRequest = require('../models/ServiceRequest');
const ContactMessage = require('../models/ContactMessage');

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const [
            projectsCount,
            servicesCount,
            jobsCount,
            applicationsCount,
            serviceRequestsCount,
            contactMessagesCount,
            newApplicationsCount,
            newServiceRequestsCount,
            newContactMessagesCount
        ] = await Promise.all([
            Project.countDocuments(),
            Service.countDocuments(),
            Job.countDocuments({ status: 'Open' }),
            JobApplication.countDocuments(),
            ServiceRequest.countDocuments(),
            ContactMessage.countDocuments(),
            JobApplication.countDocuments({ status: 'جديد' }),
            ServiceRequest.countDocuments({ status: 'جديد' }),
            ContactMessage.countDocuments({ status: 'جديد' })
        ]);

        // Fetch recent activities (limit 3 total)
        // We'll fetch 3 from each and merge, then sort and slice
        const [
            recentProjects,
            recentApplications,
            recentRequests,
            recentMessages
        ] = await Promise.all([
            Project.find().sort({ createdAt: -1 }).limit(3).select('title createdAt'),
            JobApplication.find().sort({ date: -1 }).limit(3).select('fullName position date'),
            ServiceRequest.find().sort({ date: -1 }).limit(3).select('clientName serviceType date'),
            ContactMessage.find().sort({ date: -1 }).limit(3).select('fullName subject date')
        ]);

        const activities = [
            ...recentProjects.map(i => ({ type: 'project', message: `تم إضافة مشروع: ${i.title}`, time: i.createdAt })),
            ...recentApplications.map(i => ({ type: 'job_application', message: `تقديم جديد من ${i.fullName}`, time: i.date })),
            ...recentRequests.map(i => ({ type: 'service_request', message: `طلب خدمة جديد وعميل: ${i.clientName}`, time: i.date })),
            ...recentMessages.map(i => ({ type: 'contact', message: `رسالة جديدة من ${i.fullName}: ${i.subject}`, time: i.date }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 3);

        res.json({
            counts: {
                projects: projectsCount,
                services: servicesCount,
                jobs: jobsCount,
                applications: applicationsCount,
                serviceRequests: serviceRequestsCount,
                contactMessages: contactMessagesCount,
                newApplications: newApplicationsCount,
                newServiceRequests: newServiceRequestsCount,
                newContactMessages: newContactMessagesCount
            },
            recentActivity: activities
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
