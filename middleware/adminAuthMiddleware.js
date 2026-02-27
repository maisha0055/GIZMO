import jwt from 'jsonwebtoken'

const protectAdmin = (req, res, next) => {
    const token = req.headers.token

    if (!token) {
        return res.json({ success: false, message: 'Admin access denied. Please login.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
        if (!decoded.isAdmin) {
            return res.json({ success: false, message: 'Not authorized as admin.' })
        }
        req.admin = true
        next()
    } catch (error) {
        res.json({ success: false, message: 'Invalid or expired admin token.' })
    }
}

export default protectAdmin
