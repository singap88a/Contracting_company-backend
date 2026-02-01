const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Admin = require('../models/Admin');
require('dotenv').config();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate admin & get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success, returns JWT token
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            admin: {
                id: admin.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /api/auth/settings:
 *   put:
 *     summary: Update admin email/password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings', auth, async (req, res) => {
    const { email, password } = req.body;

    // Build admin object
    const adminFields = {};
    if (email) adminFields.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        adminFields.password = await bcrypt.hash(password, salt);
    }

    try {
        let admin = await Admin.findById(req.admin.id);

        if (!admin) return res.status(404).json({ msg: 'Admin not found' });

        admin = await Admin.findByIdAndUpdate(
            req.admin.id,
            { $set: adminFields },
            { new: true }
        );

        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/auth/seed:
 *   post:
 *     summary: Helper route to seed first admin (only if none exist)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Admin seeded successfully
 *       400:
 *         description: Admin already exists
 */
router.post('/seed', async (req, res) => {
    try {
        let admin = await Admin.findOne();
        if (admin) return res.status(400).json({ msg: 'Admin already exists' });

        admin = new Admin({
            email: 'admin@example.com',
            password: 'password123'
        });

        await admin.save();
        res.json({ msg: 'Admin seeded successfully', email: 'admin@example.com', password: 'password123' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current admin info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success, returns admin info
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
