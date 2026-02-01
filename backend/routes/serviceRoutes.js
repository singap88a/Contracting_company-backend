const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const sharp = require('sharp');

// Helper function to process single image
const processImage = async (img) => {
    if (!img) return img;
    
    if (img && typeof img === 'string' && img.startsWith('data:image')) {
        try {
            const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(1000, 1000, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ quality: 80, progressive: true })
                .toBuffer();

            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        } catch (err) {
            console.error('Error processing image:', err);
            return img; 
        }
    }
    return img;
};

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/services
// @desc    Create a service
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, description, icon, image } = req.body;

    try {
        const processedImage = await processImage(image);

        const newService = new Service({
            name,
            description,
            icon,
            image: processedImage
        });

        const service = await newService.save();
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, description, icon, image } = req.body;

    // Build service object
    const serviceFields = {};
    if (name) serviceFields.name = name;
    if (description) serviceFields.description = description;
    if (icon) serviceFields.icon = icon;
    if (image) serviceFields.image = image;

    try {
        if (image) {
            serviceFields.image = await processImage(image);
        }
        
        let service = await Service.findById(req.params.id);

        if (!service) return res.status(404).json({ msg: 'Service not found' });

        service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: serviceFields },
            { new: true }
        );

        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) return res.status(404).json({ msg: 'Service not found' });

        await Service.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Service removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Service not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
