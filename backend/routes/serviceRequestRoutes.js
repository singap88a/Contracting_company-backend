const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ServiceRequest = require('../models/ServiceRequest');

// @route   POST api/service-requests
// @desc    Submit a service request
// @access  Public
router.post('/', async (req, res) => {
    const { 
        fullName, mobile, email, serviceType, 
        city, budget, area, projectDescription 
    } = req.body;

    try {
        const newRequest = new ServiceRequest({
            fullName,
            mobile,
            email,
            serviceType,
            city,
            budget,
            area,
            projectDescription
        });

        const request = await newRequest.save();
        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/service-requests
// @desc    Get all service requests
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const requests = await ServiceRequest.find().sort({ date: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/service-requests/:id/status
// @desc    Update service request status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;

    try {
        let request = await ServiceRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        request.status = status;
        await request.save();

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
