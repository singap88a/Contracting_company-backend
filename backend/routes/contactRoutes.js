const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ContactMessage = require('../models/ContactMessage');

// @route   POST api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', async (req, res) => {
    const { fullName, email, subject, message } = req.body;

    try {
        const newMessage = new ContactMessage({
            fullName,
            email,
            subject,
            message
        });

        const contactMessage = await newMessage.save();
        res.json(contactMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/contact
// @desc    Get all contact messages
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ date: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/contact/:id/status
// @desc    Update contact message status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;

    try {
        let message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ msg: 'Message not found' });

        message.status = status;
        await message.save();

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/contact/:id
// @desc    Delete a contact message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ msg: 'Message not found' });

        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Message removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
