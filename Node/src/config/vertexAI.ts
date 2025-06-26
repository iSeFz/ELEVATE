import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

export const GOOGLE_CLOUD_PROJECT_ID = "elevate-fcai-cu";
// Try different regions where embedding models are more widely available
export const GOOGLE_CLOUD_LOCATION = "us-west4"; // Changed from us-central1

export const SERIVE_ACCOUNT_KEY = serviceAccount;
