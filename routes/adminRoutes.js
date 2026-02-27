import express from 'express'
import protectAdmin from '../middleware/adminAuthMiddleware.js'
import {
    loginAdmin,
    getAllUsers, banUser, unbanUser,
    getAllCompanies, banCompany, unbanCompany,
    addNews, getNews, deleteNews,
    getReports, resolveReport
} from '../controllers/adminController.js'

const router = express.Router()

// Public
router.post('/login', loginAdmin)
router.get('/news', getNews)           // also used by homepage via /api/admin/news

// Protected (admin only)
router.get('/users', protectAdmin, getAllUsers)
router.put('/ban-user/:id', protectAdmin, banUser)
router.put('/unban-user/:id', protectAdmin, unbanUser)

router.get('/companies', protectAdmin, getAllCompanies)
router.put('/ban-company/:id', protectAdmin, banCompany)
router.put('/unban-company/:id', protectAdmin, unbanCompany)

router.post('/news', protectAdmin, addNews)
router.delete('/news/:id', protectAdmin, deleteNews)

router.get('/reports', protectAdmin, getReports)
router.put('/reports/:id/resolve', protectAdmin, resolveReport)

export default router
