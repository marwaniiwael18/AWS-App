/**
 * 🚀 AWS Lambda Handler for SkillSwap Backend
 * Serverless Express.js application wrapper
 */

const serverlessExpress = require('@codegenie/serverless-express');
const app = require('./app'); // We'll create this

// Create the serverless Express handler
const serverlessHandler = serverlessExpress({ app });

// Export the Lambda handler
module.exports.handler = async (event, context) => {
  // Log the incoming request for debugging
  console.log('📥 Lambda Event:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters
  });

  try {
    // Handle the request through serverless-express
    const result = await serverlessHandler(event, context);
    
    console.log('📤 Lambda Response:', {
      statusCode: result.statusCode,
      headers: result.headers
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Lambda Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
        timestamp: new Date().toISOString()
      })
    };
  }
}; 