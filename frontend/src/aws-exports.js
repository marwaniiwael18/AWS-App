// AWS Configuration for SkillSwap
// Updated with NEW simple User Pool credentials

// Determine environment-specific configuration
const isProd = import.meta.env.PROD;
const baseUrl = isProd 
  ? 'https://skillswap.aws-deploy.com' 
  : 'http://localhost:5173';

const awsconfig = {
  // AWS Region
  aws_project_region: 'eu-north-1',
  aws_cognito_region: 'eu-north-1',
  
  // NEW Simple Cognito User Pool Configuration
  aws_user_pools_id: 'eu-north-1_tr3nTK4VG',
  aws_user_pools_web_client_id: '5heee4rhh886sa7nl4gqerqa2e',
  
  // Cognito Authority URL
  aws_cognito_authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_tr3nTK4VG',
  
  // Simple Cognito Configuration
  aws_cognito_username_attributes: ['email'],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['email'], // Only email required!
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ['email'],
  
  // OAuth Configuration - Environment-aware URLs
  oauth: {
    domain: 'skillswap-simple.auth.eu-north-1.amazoncognito.com',
    scope: ['openid', 'email', 'profile'],
    redirectSignIn: `${baseUrl}/`,
    redirectSignOut: `${baseUrl}/`,
    responseType: 'code'
  },
  
  // API Configuration (for future use)
  aws_appsync_graphqlEndpoint: 'https://your-api-endpoint.appsync-api.eu-north-1.amazonaws.com/graphql',
  aws_appsync_region: 'eu-north-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  
  // S3 Configuration (for future use)
  Storage: {
    AWSS3: {
      bucket: 'skillswap-storage-bucket',
      region: 'eu-north-1'
    }
  }
};

export default awsconfig; 