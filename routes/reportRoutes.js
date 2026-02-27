import express from 'express'
import { submitReport } from '../controllers/reportController.js'

const router = express.Router()

// Any logged-in user or company can submit a report
router.post('/', submitReport)

export default router
