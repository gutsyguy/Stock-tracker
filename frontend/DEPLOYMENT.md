# Vercel Deployment Guide

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

### Required for Authentication
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://stock-tracker-eight-eta.vercel.app`)
- `NEXTAUTH_SECRET` - A random secret string (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Required for Stock Data APIs
- `RAPIDAPI_KEY` - Your RapidAPI key for Yahoo Finance
- `RAPIDAPI_HOST` - `apidojo-yahoo-finance-v1.p.rapidapi.com`
- `ALPACA_API` - Your Alpaca API key
- `ALPACA_SECRET` - Your Alpaca secret key
- `ALPACA_URL` - `https://data.alpaca.markets`

## Deployment Steps

1. **Connect to Vercel**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add all the required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your app

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)

## Troubleshooting

### 404 Errors
- Ensure all environment variables are set
- Check that the build completed successfully
- Verify the domain is correctly configured

### Authentication Issues
- Verify Google OAuth credentials are correct
- Check that redirect URIs match your domain
- Ensure NEXTAUTH_URL matches your Vercel domain

### API Errors
- Verify all API keys are valid and have proper permissions
- Check API rate limits
- Ensure external APIs are accessible from Vercel
