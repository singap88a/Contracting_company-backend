const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const sharp = require('sharp');

// Helper function to process images
const processImages = async (images) => {
    if (!images) return null;
    let imageToProcess = Array.isArray(images) ? images[0] : images;
    
    if (imageToProcess && typeof imageToProcess === 'string' && imageToProcess.startsWith('data:image')) {
        try {
            const base64Data = imageToProcess.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 1000, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ quality: 80, progressive: true })
                .toBuffer();

            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        } catch (err) {
            console.error('Error processing image:', err);
            return imageToProcess; 
        }
    }
    return imageToProcess; 
};

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Get all team members
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: List of all team members
 */
router.get('/', async (req, res) => {
    try {
        const team = await Team.find().sort({ createdAt: -1 });
        res.json(team);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/team/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [Team]
 */
router.get('/:id', async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);
        if (!member) return res.status(404).json({ msg: 'Member not found' });
        res.json(member);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Member not found' });
        res.status(500).send('Server Error');
    }
});


/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Create a team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team member created successfully
 */
router.post('/', auth, async (req, res) => {
    const { name, role, bio, image, socials, qualifications } = req.body;

    try {
        const processedImage = await processImages(image);

        const newMember = new Team({
            name, role, bio, image: processedImage, socials, qualifications
        });

        const member = await newMember.save();
        res.json(member);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/team/{id}:
 *   put:
 *     summary: Update a team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, async (req, res) => {
    const { name, role, bio, image, socials, qualifications } = req.body;

    const memberFields = { name, role, bio, socials, qualifications };

    try {
        if (image) {
            memberFields.image = await processImages(image);
        }
        let member = await Team.findById(req.params.id);

        if (!member) return res.status(404).json({ msg: 'Member not found' });

        member = await Team.findByIdAndUpdate(
            req.params.id,
            { $set: memberFields },
            { new: true }
        );

        res.json(member);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/team/{id}:
 *   delete:
 *     summary: Delete a team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);

        if (!member) return res.status(404).json({ msg: 'Member not found' });

        await Team.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Member removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
