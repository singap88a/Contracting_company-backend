const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['جديد', 'تمت القراءة', 'تم الرد'],
        default: 'جديد'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
