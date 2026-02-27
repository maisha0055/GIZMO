import mongoose from 'mongoose'

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['news', 'journal'], default: 'news' },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
})

const News = mongoose.model('News', newsSchema)
export default News
