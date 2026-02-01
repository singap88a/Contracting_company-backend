const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    category: {
        type: String,
        required: true
    },
    location: String,
    client: String,
    area: String,
    year: String,
    description: String,
    images: [String],
    features: [String],
    details: [{
        label: String,
        value: String,
        icon: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);
