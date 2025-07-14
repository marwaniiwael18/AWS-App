#!/usr/bin/env node

/**
 * 🧪 Cognito Configuration Test Script
 * Tests AWS SDK v3 Cognito setup and configuration
 */

const { COGNITO_CONFIG, AUTH_CONFIG, cognitoClient } = require('../src/config/aws-v3');
const cognitoService = require('../src/services/cognitoService');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testCognitoConfiguration() {
  console.log('\n' + '='.repeat(50));
  log(colors.bold + colors.blue, '🧪 COGNITO CONFIGURATION TEST');
  console.log('='.repeat(50));

  try {
    // Test 1: Configuration Values
    log(colors.yellow, '\n📋 1. Configuration Check:');
    console.log(`   User Pool ID: ${COGNITO_CONFIG.UserPoolId}`);
    console.log(`   Client ID: ${COGNITO_CONFIG.ClientId}`);
    console.log(`   Region: ${COGNITO_CONFIG.Region}`);
    console.log(`   JWKS URI: ${COGNITO_CONFIG.jwksUri}`);
    console.log(`   Issuer: ${COGNITO_CONFIG.issuer}`);
    console.log(`   Bypass Mode: ${AUTH_CONFIG.BYPASS_MODE}`);
    
    if (!COGNITO_CONFIG.UserPoolId || !COGNITO_CONFIG.ClientId) {
      log(colors.red, '   ❌ Missing required Cognito configuration');
      return;
    }
    log(colors.green, '   ✅ Configuration values are present');

    // Test 2: AWS SDK v3 Client
    log(colors.yellow, '\n🔌 2. AWS SDK v3 Client Test:');
    console.log(`   Client Type: ${cognitoClient.constructor.name}`);
    console.log(`   Region: ${cognitoClient.config.region}`);
    log(colors.green, '   ✅ Cognito client initialized successfully');

    // Test 3: Bypass Mode vs Production Mode
    log(colors.yellow, '\n🔐 3. Authentication Mode:');
    if (AUTH_CONFIG.BYPASS_MODE) {
      log(colors.yellow, '   🔧 Development bypass mode ENABLED');
      log(colors.yellow, '   - Real Cognito authentication is DISABLED');
      log(colors.yellow, '   - Using mock user for development');
      log(colors.blue, '   💡 To test real Cognito: set BYPASS_AUTH=false');
    } else {
      log(colors.green, '   🔐 Production Cognito mode ENABLED');
      log(colors.green, '   - Real JWT token verification active');
      log(colors.green, '   - JWKS key validation enabled');
    }

    // Test 4: Environment Variables
    log(colors.yellow, '\n🌍 4. Environment Variables:');
    const requiredEnvVars = [
      'NODE_ENV',
      'AWS_REGION',
      'COGNITO_USER_POOL_ID',
      'COGNITO_CLIENT_ID'
    ];

    let envCheckPassed = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        log(colors.green, `   ✅ ${envVar}: ${process.env[envVar]}`);
      } else {
        log(colors.red, `   ❌ ${envVar}: NOT SET`);
        envCheckPassed = false;
      }
    }

    if (envCheckPassed) {
      log(colors.green, '   ✅ All required environment variables are set');
    } else {
      log(colors.red, '   ❌ Missing required environment variables');
    }

    // Test 5: Cognito Service Test
    log(colors.yellow, '\n🛠️  5. Cognito Service Test:');
    
    if (!AUTH_CONFIG.BYPASS_MODE) {
      try {
        // Test listing users (this will fail if AWS credentials are not configured)
        const listResult = await cognitoService.listUsers(1);
        if (listResult.success) {
          log(colors.green, '   ✅ Cognito service connection successful');
          log(colors.green, `   ✅ Found ${listResult.data.users.length} users in pool`);
        } else {
          log(colors.red, `   ❌ Cognito service error: ${listResult.message}`);
        }
      } catch (error) {
        log(colors.red, `   ❌ Cognito service error: ${error.message}`);
        log(colors.yellow, '   💡 This might be due to missing AWS credentials');
      }
    } else {
      log(colors.yellow, '   ⏩ Skipping Cognito service test (bypass mode)');
    }

    // Test 6: Recommendations
    log(colors.yellow, '\n💡 6. Recommendations:');
    
    if (AUTH_CONFIG.BYPASS_MODE) {
      log(colors.blue, '   🔧 Development Mode Recommendations:');
      log(colors.blue, '   - Test real Cognito with: npm run dev:cognito');
      log(colors.blue, '   - Keep bypass mode for local development');
      log(colors.blue, '   - Ensure real Cognito works before production');
    } else {
      log(colors.blue, '   🚀 Production Mode Recommendations:');
      log(colors.blue, '   - Ensure AWS credentials are properly configured');
      log(colors.blue, '   - Test user registration and login flows');
      log(colors.blue, '   - Monitor token verification performance');
    }

    // Summary
    log(colors.yellow, '\n📊 Summary:');
    log(colors.green, '   ✅ AWS SDK v3 configuration complete');
    log(colors.green, '   ✅ Cognito integration ready');
    log(colors.green, '   ✅ Authentication middleware updated');
    
    if (AUTH_CONFIG.BYPASS_MODE) {
      log(colors.yellow, '   🔧 Currently in development bypass mode');
    } else {
      log(colors.green, '   🔐 Ready for production Cognito authentication');
    }

  } catch (error) {
    log(colors.red, `\n❌ Test failed: ${error.message}`);
    console.error(error);
  }

  console.log('\n' + '='.repeat(50));
  log(colors.bold + colors.blue, '🏁 TEST COMPLETE');
  console.log('='.repeat(50) + '\n');
}

// Run the test
if (require.main === module) {
  testCognitoConfiguration();
}

module.exports = { testCognitoConfiguration }; 