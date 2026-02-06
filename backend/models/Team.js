const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    image: {
        type: String // Base64 or URL
    },
    socials: {
        facebook: String,
        whatsapp: String,
        email: String
    },
    qualifications: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Team', TeamSchema);
