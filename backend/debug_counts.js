const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

const Project = require('./models/Project');
const Service = require('./models/Service');
const Job = require('./models/Job');
const JobApplication = require('./models/JobApplication');
const ServiceRequest = require('./models/ServiceRequest');
const ContactMessage = require('./models/ContactMessage');

const checkCounts = async () => {
    try {
        await connectDB();
        
        console.log('--- Database Counts ---');
        console.log('Projects:', await Project.countDocuments());
        console.log('Services:', await Service.countDocuments());
        console.log('Jobs:', await Job.countDocuments());
        console.log('Job Applications:', await JobApplication.countDocuments());
        console.log('Service Requests:', await ServiceRequest.countDocuments());
        console.log('Contact Messages:', await ContactMessage.countDocuments());
        console.log('-----------------------');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCounts();
