import express from 'express'
import { ChangeJobApplicationStatus, changeVisibility, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

// Company login
router.post('/login', loginCompany)

// Get company data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany, postJob)

// Get applicants data of a company - FIXED endpoint to match ViewApplications frontend call
router.get('/job-applications', protectCompany, getCompanyJobApplicants)

// Get company job list
router.get('/list-jobs', protectCompany, getCompanyPostedJobs)

// Change applicant status - FIXED endpoint to match frontend
router.post('/change-application-status', protectCompany, ChangeJobApplicationStatus)

// Change job visibility
router.post('/change-visibility', protectCompany, changeVisibility)

export default router