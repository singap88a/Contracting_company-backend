const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    budget: {
        type: String
    },
    area: {
        type: String
    },
    projectDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'جديد'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
