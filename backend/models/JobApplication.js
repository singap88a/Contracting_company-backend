const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    cv: {
        type: String, // Base64 or URL
        required: true
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum: ['جديد', 'قيد المراجعة', 'مقبول', 'مرفوض'],
        default: 'جديد'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
