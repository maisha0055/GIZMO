import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Helper function to extract user info from Clerk token
const getUserFromToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return payload;
  } catch (e) {
    console.error('Error decoding token:', e.message);
    return null;
  }
};

// Get User data
export const getUserData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userPayload = getUserFromToken(authHeader);
    
    if (!userPayload || !userPayload.sub) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const userId = userPayload.sub;
    let user = await User.findById(userId);

    // Auto-create user if doesn't exist
    if (!user) {
      console.log('Creating new user:', userId);
      user = await User.create({
        _id: userId,
        email: userPayload.email || `${userId}@temp.com`,
        name: userPayload.name || userPayload.given_name || userPayload.email?.split('@')[0] || 'User',
        image: userPayload.picture || userPayload.image_url || '',
        resume: ''
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("getUserData error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const authHeader = req.headers.authorization;
    const userPayload = getUserFromToken(authHeader);
    
    if (!userPayload || !userPayload.sub) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const userId = userPayload.sub;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    // Get or create user
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        _id: userId,
        email: userPayload.email || `${userId}@temp.com`,
        name: userPayload.name || userPayload.given_name || 'User',
        image: userPayload.picture || '',
        resume: ''
      });
    }

    if (!user.resume) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload your resume before applying" 
      });
    }

    const jobData = await Job.findById(jobId);
    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const existingApplication = await JobApplication.findOne({ 
      jobId: new mongoose.Types.ObjectId(jobId), 
      userId: userId 
    });
    
    if (existingApplication) {
      return res.status(409).json({ success: false, message: "Already Applied" });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId: userId,
      jobId: new mongoose.Types.ObjectId(jobId),
      date: Date.now(),
      status: "Pending",
    });

    res.json({ success: true, message: "Applied Successfully" });
  } catch (error) {
    console.error("applyForJob error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user applications
export const getUserJobApplications = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userPayload = getUserFromToken(authHeader);
    
    if (!userPayload || !userPayload.sub) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const userId = userPayload.sub;

    // Auto-create user if needed
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        _id: userId,
        email: userPayload.email || `${userId}@temp.com`,
        name: userPayload.name || userPayload.given_name || 'User',
        image: userPayload.picture || '',
        resume: ''
      });
    }

    const applications = await JobApplication.find({ userId: userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary date")
      .sort({ date: -1 })
      .exec();

    return res.json({ 
      success: true, 
      applications: applications
    });
    
  } catch (error) {
    console.error("getUserJobApplications error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};

// Update user resume - CRITICAL FIX
export const updateUserResume = async (req, res) => {
  try {
    console.log('=== RESUME UPLOAD START ===');
    
    const authHeader = req.headers.authorization;
    console.log('1. Auth header:', authHeader ? 'EXISTS' : 'MISSING');
    
    const userPayload = getUserFromToken(authHeader);
    console.log('2. Token decoded:', userPayload ? 'YES' : 'NO');
    
    if (!userPayload || !userPayload.sub) {
      console.log('ERROR: No valid token');
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const userId = userPayload.sub;
    console.log('3. User ID:', userId);
    
    const resumeFile = req.file;
    console.log('4. File received:', resumeFile ? 'YES' : 'NO');
    
    if (!resumeFile) {
      console.log('ERROR: No file');
      return res.status(400).json({ 
        success: false, 
        message: "No resume file provided" 
      });
    }

    console.log('5. File details:', {
      name: resumeFile.originalname,
      size: resumeFile.size,
      type: resumeFile.mimetype
    });

    if (resumeFile.mimetype !== "application/pdf") {
      return res.status(400).json({ 
        success: false, 
        message: "Only PDF files allowed" 
      });
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: "File too large (max 5MB)" 
      });
    }

    console.log('6. Checking/creating user...');
    let userData = await User.findById(userId);
    
    if (!userData) {
      console.log('6a. Creating new user...');
      
      // Extract user info with fallbacks
      const userEmail = userPayload.email || `${userId}@temp.com`;
      const userName = userPayload.name || userPayload.given_name || userPayload.email?.split('@')[0] || 'User';
      const userImage = userPayload.picture || userPayload.image_url || 'https://via.placeholder.com/150';
      
      console.log('Creating user with:', { email: userEmail, name: userName, image: userImage });
      
      userData = await User.create({
        _id: userId,
        email: userEmail,
        name: userName,
        image: userImage,
        resume: ''
      });
      console.log('6b. User created successfully');
    } else {
      console.log('6c. User exists');
    }

    console.log('7. Uploading to Cloudinary...');
    const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
      resource_type: "raw",
      folder: "resumes",
      format: "pdf",
    });
    console.log('8. Cloudinary upload success:', resumeUpload.secure_url);

    userData.resume = resumeUpload.secure_url;
    await userData.save();
    console.log('9. Database updated');

    console.log('=== RESUME UPLOAD SUCCESS ===');
    return res.json({ 
      success: true, 
      message: "Resume Updated Successfully"
    });
    
  } catch (error) {
    console.error("=== RESUME UPLOAD FAILED ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: "Upload failed: " + error.message
    });
  }
};