// Builds base64 Basic auth header from WC consumer key + secret
export function getWCAuthHeader(): string {
  const key    = process.env.WC_CONSUMER_KEY    || '';
  const secret = process.env.WC_CONSUMER_SECRET || '';
  const encoded = Buffer.from(`${key}:${secret}`).toString('base64');
  return `Basic ${encoded}`;
}

// Standard headers for all WC API calls
export const wcHeaders = {
  'Authorization': getWCAuthHeader(),
  'Content-Type':  'application/json',
};

// Standard headers for wp/v2 calls (deal CPT, no auth needed for GET)
export const wpHeaders = {
  'Content-Type': 'application/json',
};