const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Contact Info
    address: { type: String, default: 'الرياض، المملكة العربية السعودية' },
    phone: { type: String, default: '+966 11 234 5678' },
    email: { type: String, default: 'info@contracting-co.com' },
    workingHours: { type: String, default: 'الأحد - الخميس: 8:00 ص - 5:00 م' },
    
    // Social Media
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    
    // Statistics
    statsYears: { type: String, default: '+15' },
    statsProjects: { type: String, default: '+500' },
    statsAwards: { type: String, default: '+50' },
    statsEngineers: { type: String, default: '+120' },
    
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
