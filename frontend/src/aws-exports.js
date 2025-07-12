// Basic AWS configuration for development
const awsconfig = {
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_XXXXXXXXX', // Placeholder - will be replaced when AWS is configured
  aws_user_pools_web_client_id: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Placeholder - will be replaced when AWS is configured
  oauth: {},
  aws_cognito_username_attributes: ['email'],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['email'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ['email'],
  aws_appsync_graphqlEndpoint: 'https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql', // Placeholder
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Placeholder
};

export default awsconfig; 