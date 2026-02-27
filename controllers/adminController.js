import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Company from '../models/company.js'
import News from '../models/News.js'
import Report from '../models/Report.js'

// ─── Admin Login ────────────────────────────────────────────────────────────

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body

    if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.json({ success: false, message: 'Invalid admin credentials.' })
    }

    const token = jwt.sign(
        { isAdmin: true },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({ success: true, token })
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-__v')
        res.json({ success: true, users })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const banUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBanned: true })
        res.json({ success: true, message: 'User banned.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const unbanUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBanned: false })
        res.json({ success: true, message: 'User unbanned.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Companies ───────────────────────────────────────────────────────────────

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find({}).select('-password -__v')
        res.json({ success: true, companies })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const banCompany = async (req, res) => {
    try {
        await Company.findByIdAndUpdate(req.params.id, { isBanned: true })
        res.json({ success: true, message: 'Company banned.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const unbanCompany = async (req, res) => {
    try {
        await Company.findByIdAndUpdate(req.params.id, { isBanned: false })
        res.json({ success: true, message: 'Company unbanned.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export const addNews = async (req, res) => {
    try {
        const { title, content, category, imageUrl } = req.body
        if (!title || !content) {
            return res.json({ success: false, message: 'Title and content are required.' })
        }
        const news = await News.create({ title, content, category, imageUrl })
        res.json({ success: true, news })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ createdAt: -1 })
        res.json({ success: true, news })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: 'News deleted.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ createdAt: -1 })
        res.json({ success: true, reports })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const resolveReport = async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' })
        res.json({ success: true, message: 'Report resolved.' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
