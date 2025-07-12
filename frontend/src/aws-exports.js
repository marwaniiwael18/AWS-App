// AWS Configuration for SkillSwap
// Replace these placeholder values with your actual AWS service configurations

const awsconfig = {
  // AWS Region
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  
  // Cognito User Pool Configuration
  // Get these from AWS Console > Cognito > User Pools
  aws_user_pools_id: 'us-east-1_XXXXXXXXX', // Replace with your User Pool ID
  aws_user_pools_web_client_id: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with your App Client ID
  
  // Cognito Configuration
  aws_cognito_username_attributes: ['email'],
  aws_cognito_social_providers: [], // Add 'GOOGLE', 'FACEBOOK', etc. if needed
  aws_cognito_signup_attributes: ['email', 'name'],
  aws_cognito_mfa_configuration: 'OFF', // Change to 'ON' if you want MFA
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [
      'REQUIRES_LOWERCASE',
      'REQUIRES_UPPERCASE', 
      'REQUIRES_NUMBERS',
      'REQUIRES_SYMBOLS'
    ]
  },
  aws_cognito_verification_mechanisms: ['email'],
  
  // API Gateway Configuration (if using)
  aws_cloud_logic_custom: [
    {
      name: 'skillswap-api',
      endpoint: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod', // Replace with your API Gateway URL
      region: 'us-east-1'
    }
  ],
  
  // DynamoDB Configuration (if using AppSync)
  aws_appsync_graphqlEndpoint: 'https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql', // Replace with your AppSync endpoint
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS', // or 'API_KEY'
  aws_appsync_apiKey: 'da2-XXXXXXXXXXXXXXXXXXXXXXXXXX', // Only if using API_KEY auth
  
  // S3 Configuration (for file uploads)
  Storage: {
    AWSS3: {
      bucket: 'skillswap-storage-bucket', // Replace with your S3 bucket name
      region: 'us-east-1',
    }
  }
};

export default awsconfig; 