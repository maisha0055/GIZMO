import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    reportedBy: { type: String, required: true },       // userId (Clerk ID) or company _id
    reportedByType: { type: String, enum: ['user', 'company'], required: true },
    targetId: { type: String, required: true },          // who is being reported
    targetType: { type: String, enum: ['user', 'company'], required: true },
    targetName: { type: String },                        // display name for dashboard
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
})

const Report = mongoose.model('Report', reportSchema)
export default Report
