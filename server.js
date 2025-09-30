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
import { clerkMiddleware } from '@clerk/express'

// Wrap everything in an async function
const startServer = async () => {
  try {
    // Initialize Express
    const app = express()
    
    // Connect to database and cloudinary
    await connectDB()
    await connectCloudinary()
    
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
    
    // Sentry error handler (must be after all routes)
    Sentry.setupExpressErrorHandler(app);
    
    // Port
    const PORT = process.env.PORT || 4000
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
    
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()