import './config/instrument.js'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import { clerkMiddleware } from '@clerk/express'

// Initialize Express
const app = express()

// Track connection state to avoid reconnecting on every request
let isConnected = false

// Middleware to lazily connect DB and Cloudinary (required for serverless)
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB()
      await connectCloudinary()
      isConnected = true
    } catch (err) {
      console.error('Connection error:', err)
      return res.status(500).json({ message: 'Failed to connect to database' })
    }
  }
  next()
})

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reports', reportRoutes)

// Sentry error handler (must be after all routes)
Sentry.setupExpressErrorHandler(app);

// Export for Vercel serverless
export default app