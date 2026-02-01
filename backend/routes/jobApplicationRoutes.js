const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const JobApplication = require('../models/JobApplication');

// @route   POST api/job-applications
// @desc    Submit a job application
// @access  Public
router.post('/', async (req, res) => {
    const { 
        fullName, email, mobile, position, 
        jobId, cv, coverLetter 
    } = req.body;

    try {
        const newApplication = new JobApplication({
            fullName,
            email,
            mobile,
            position,
            jobId,
            cv,
            coverLetter
        });

        const application = await newApplication.save();
        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/job-applications
// @desc    Get all job applications
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const applications = await JobApplication.find()
            .populate('jobId', 'title')
            .sort({ date: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/job-applications/:id/status
// @desc    Update application status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;

    try {
        let application = await JobApplication.findById(req.params.id);
        if (!application) return res.status(404).json({ msg: 'Application not found' });

        application.status = status;
        await application.save();

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
