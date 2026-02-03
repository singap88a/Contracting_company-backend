const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settings = require('../models/Settings');

// @route   GET api/settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings({});
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/settings
// @desc    Update site settings
// @access  Private
router.put('/', auth, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            // Update fields from body
            Object.keys(req.body).forEach(key => {
                settings[key] = req.body[key];
            });
            settings.updatedAt = Date.now();
        }
        
        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
