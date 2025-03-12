# Splitify Deployment Guide

This guide will walk you through deploying the Splitify application to Vercel.

## Prerequisites

Before you begin, make sure you have:

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/signup) with your Splitify repository
3. All external services configured:
   - [Supabase](https://supabase.com) project with database and storage
   - [Clerk](https://clerk.dev) application for authentication
   - [Stripe](https://stripe.com) account for payments
   - [AWS](https://aws.amazon.com) account for OCR (Textract)
   - [Uber Developer](https://developer.uber.com) account (if using rideshare integration)

## Deployment Steps

### 1. Prepare Your Environment Variables

All environment variables from your local `.env.local` file must be added to Vercel. Use `.env.production` as a template.

Ensure you have production values for:
- Database connection strings
- API keys
- Webhook endpoints
- Application URLs

### 2. Configure Supabase

Before deployment, ensure:

1. Your PostgreSQL database is properly configured in Supabase
2. Storage buckets `receipts` and `payment_proofs` are created
3. Row Level Security (RLS) policies are set up:

```sql
-- Create policy to allow users to access receipts from their events
CREATE POLICY "Users can access receipts from their events"
ON storage.objects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM participants
    JOIN expenses ON participants.event_id = expenses.event_id
    JOIN receipts ON expenses.id = receipts.expense_id
    WHERE 
      participants.user_id = auth.uid() AND
      storage.foldername(name)[1] = 'receipts'
  )
);

-- Create policy to allow users to access payment proofs from their events
CREATE POLICY "Users can access payment proofs from their events"
ON storage.objects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM participants
    JOIN settlements ON participants.event_id = settlements.event_id
    WHERE 
      participants.user_id = auth.uid() AND
      storage.foldername(name)[1] = 'payment_proofs'
  )
);
```

### 3. Configure Clerk

1. Update your Clerk application settings:
   - Set the production domain in your Clerk dashboard
   - Configure social connections if needed
   - Set up email templates for production

2. Ensure redirect URLs are correctly configured for production

### 4. Configure Stripe

1. Switch Stripe to live mode (from test mode)
2. Update webhook endpoints to point to your production URL
3. Create live products for subscriptions:
   - Monthly plan ($10/month)
   - Yearly plan ($100/year)
4. Update product/price IDs in your Vercel environment variables

### 5. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: Leave as default
   - **Output Directory**: Leave as default

5. Add environment variables:
   - Click "Environment Variables"
   - Add all variables from your `.env.production` file with their production values
   - Ensure `NODE_ENV` is set to `production`
   - Make sure `NEXT_PUBLIC_APP_URL` is set to your Vercel deployment URL
   
6. Click "Deploy"

### 6. Set Up Custom Domain (Optional)

1. In your Vercel project, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS settings
4. Update any services that rely on the domain:
   - Clerk redirect URLs
   - Stripe webhook endpoints
   - `NEXT_PUBLIC_APP_URL` environment variable

### 7. Verify Webhook Endpoints

Ensure all webhook endpoints are correctly configured:

1. **Stripe**: `/api/stripe/webhooks`
   - Update the webhook endpoint in Stripe dashboard to point to your production URL
   - Update the webhook secret in Vercel env variables

2. **Clerk**: Webhooks should work automatically if you've configured Clerk correctly

### 8. Test Production Deployment

After deployment, test all critical paths:

1. User registration and login
2. Creating and managing events
3. Adding expenses and splitting costs
4. Processing payments and verifying settlements
5. Subscription upgrades
6. Receipt upload and OCR processing
7. Rideshare integration (if applicable)

### 9. Monitoring and Maintenance

1. Set up error monitoring (optional):
   - [Sentry](https://sentry.io)
   - [LogRocket](https://logrocket.com)
   
2. Configure regular database backups in Supabase

3. Set up usage alerts for:
   - Supabase storage limits
   - Stripe transaction volume
   - API usage limits

## Troubleshooting

### Common Issues

1. **Environment Variable Problems**:
   - Check that all required variables are set in Vercel
   - Ensure `NEXT_PUBLIC_` prefix is used for client-side variables

2. **Database Connection Issues**:
   - Verify your Supabase connection string is correct
   - Check IP allowlists if you've restricted access

3. **Authentication Failures**:
   - Verify Clerk domain settings
   - Check redirect URLs

4. **Webhook Failures**:
   - Ensure webhook endpoints are correctly configured
   - Verify secrets match between services and your application

### Getting Help

If you encounter issues during deployment, check:
1. Vercel deployment logs
2. Supabase database and storage logs
3. Clerk and Stripe dashboards for error messages

## Production Checklist

Before considering your deployment complete, verify:

- [ ] All environment variables are properly set
- [ ] Database and storage are correctly configured
- [ ] Authentication flows work as expected
- [ ] Subscription management is operational
- [ ] Webhook endpoints are receiving events
- [ ] Storage permissions work correctly
- [ ] Error handling and fallbacks are in place
- [ ] Performance is acceptable under load

## Future Updates

For future updates to your application:

1. Push changes to your GitHub repository
2. Vercel will automatically build and deploy updates
3. Monitor deployment logs for any issues
4. Test critical paths after each significant update 