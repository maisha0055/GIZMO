import express from 'express'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'
import upload from '../config/multer.js'

const router = express.Router()

//Get user data
router.get('/user', getUserData)

//Apply for a job
router.post('/apply', applyForJob)

//FIXED: The route should match what frontend is calling
router.get('/applications', getUserJobApplications)

//Update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume)

export default router;