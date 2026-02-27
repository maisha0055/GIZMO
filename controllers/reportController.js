import Report from '../models/Report.js'

// Submit a report (any logged-in user or company)
export const submitReport = async (req, res) => {
    try {
        const { reportedBy, reportedByType, targetId, targetType, targetName, reason } = req.body

        if (!reportedBy || !reportedByType || !targetId || !targetType || !reason) {
            return res.json({ success: false, message: 'Missing required fields.' })
        }

        const report = await Report.create({
            reportedBy,
            reportedByType,
            targetId,
            targetType,
            targetName,
            reason
        })

        res.json({ success: true, message: 'Report submitted successfully.', report })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
