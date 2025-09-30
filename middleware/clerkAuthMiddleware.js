import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Create Clerk authentication middleware
export const clerkAuth = ClerkExpressRequireAuth({
  // Add any specific configuration if needed
});

// Alternative middleware if the above doesn't work
// Create this file: middleware/clerkAuthMiddleware.js

export const verifyClerkAuth = async (req, res, next) => {
    try {
      // Extract the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'No authorization token provided' 
        });
      }
  
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'No token provided' 
        });
      }
  
      // For now, we'll extract the user ID from the Clerk JWT token
      // In a production environment, you should verify the token signature with Clerk
      try {
        // Decode the JWT payload (without verification for now)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        
        // The Clerk user ID should be in the 'sub' field
        if (!payload.sub) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid token: no user ID found' 
          });
        }
  
        // Attach the user ID to the request
        req.auth = { 
          userId: payload.sub 
        };
        
        console.log('Authenticated user:', payload.sub);
        next();
        
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token format' 
        });
      }
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }
  };
  
  export default verifyClerkAuth;