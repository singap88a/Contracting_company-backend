const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const sharp = require('sharp');

// Helper function to process images
const processImage = async (img) => {
    if (img && typeof img === 'string' && img.startsWith('data:image')) {
        try {
            const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const compressedBuffer = await sharp(buffer)
                .resize(800, 800, { 
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

// @desc    Get all approved testimonials
// @route   GET /api/testimonials/approved
// @access  Public
router.get('/approved', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Submit a new testimonial
// @route   POST /api/testimonials
// @access  Public
router.post('/', async (req, res) => {
  const { name, role, rating, image, description, source } = req.body;
  
  if (!name || !rating || !image || !description) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    const processedImage = await processImage(image);

    const testimonial = new Testimonial({
      name,
      role,
      rating,
      image: processedImage,
      description,
      source: source || 'user'
    });

    const newTestimonial = await testimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Get all testimonials (for admin)
// @route   GET /api/testimonials
// @access  Private/Admin (Middleware status: TBD, using public for now or check existing auth)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Approve a testimonial
// @route   PUT /api/testimonials/:id/approve
// @access  Private/Admin
router.put('/:id/approve', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.id || req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    testimonial.status = 'approved';
    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete/Reject a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    await testimonial.deleteOne();
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, role, rating, image, description, status, source } = req.body;
    let testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updateFields = { name, role, rating, description, status, source };
    
    if (image && image.startsWith('data:image')) {
      updateFields.image = await processImage(image);
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
