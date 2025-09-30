import Company from "../models/company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";


// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })

    }

    try {
        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: "Company aleeady registered" })

        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Company login 
export const loginCompany = async (req, res) => {
    const { email, password } = req.body;

    try {
        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })
        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

// Get company data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }
}

// Post a new job
export const postJob = async (req, res) => {

    const { title, description, location, salary, level, category } = req.body

    const companyId = req.company._id

    try {

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newJob.save()

        res.json({ success: true, newJob })
    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get company job applicants
// Get company job applicants - ENHANCED with debugging
// Get company job applicants - FIXED with resume debugging
// In companyController.js - getCompanyJobApplicants function
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id

    console.log('=== Fetching applications for company ===');
    console.log('Company ID:', companyId);

    // Find job applications for this company and populate related data
    const applications = await JobApplication.find({ companyId })
      .populate({
        path: 'userId',
        model: 'User', // Explicitly specify the model
        select: 'name image resume'
      })
      .populate('jobId', 'title location category level salary')
      .populate('companyId', 'name image')
      .exec()

    console.log('Raw applications found:', applications.length);
    
    // Filter out any applications with missing data
    const validApplications = applications.filter(app => 
      app.userId && app.jobId && app.companyId
    );

    console.log('Valid applications after filtering:', validApplications.length);

    return res.json({ success: true, applications: validApplications })

  } catch (error) {
    console.error('Error fetching company job applications:', error);
    res.json({ success: false, message: error.message })
  }
}
// Get company posted jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        //(TODO) Adding No. of applicant info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id })
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Change job applicant status 
export const ChangeJobApplicationStatus = async (req, res) => {

    try {
        const { id, status } = req.body

        //find job application and update staus 
        await JobApplication.findOneAndUpdate({ _id: id }, { status })

        res.json({ success: true, message: 'status changed' })

    } catch (error) {
        
        res.json({success:false, message: error.message})
    }


}

// Change job visibility 
export const changeVisibility = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible

        }

        await job.save()

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}
