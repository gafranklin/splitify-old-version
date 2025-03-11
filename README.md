# Building Apps with the o1 Pro Template System

This is the repo for a free workshop on how to use [OpenAI's o1-pro](https://chatgpt.com/) to build full-stack web apps with a [starter template](https://github.com/mckaywrigley/mckays-app-template).

It is part 1 of a 2 part series. This is the beginner workshop. The advanced workshop will be released on February 24th.

## Workshop Video

You can find the video for this workshop on [X](https://x.com/mckaywrigley/status/1891544731496206365) and [YouTube](https://www.youtube.com/watch?v=Y4n_p9w8pGY).

This workshop is also available in course form on [Takeoff](https://www.jointakeoff.com/) - we will continue to add to it and keep it updated with the latest model releases over time.

Use code `O1PRO` for 25% off at checkout.

I get asked all the time for an example of content on Takeoff, so hopefully this workshop gives you a feel for our content and my teaching style.

## About Me

My name is [Mckay](https://www.mckaywrigley.com/).

I'm currently building [Takeoff](https://www.jointakeoff.com/) - the best place on the internet to learn how to build with AI.

Follow me on [X](https://x.com/mckaywrigley) and subscribe to my [YouTube](https://www.youtube.com/channel/UCXZFVVCFahewxr3est7aT7Q) for more free AI coding tutorials & guides.

## Tech Stack

- AI Model: [o1-pro](https://chatgpt.com/)
- IDE: [Cursor](https://www.cursor.com/)
- AI Tools: [RepoPrompt](https://repoprompt.com/), [V0](https://v0.dev/), [Perplexity](https://www.perplexity.com/)
- Frontend: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs/guides/nextjs), [Shadcn](https://ui.shadcn.com/docs/installation), [Framer Motion](https://www.framer.com/motion/introduction/)
- Backend: [PostgreSQL](https://www.postgresql.org/about/), [Supabase](https://supabase.com/), [Drizzle](https://orm.drizzle.team/docs/get-started-postgresql), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Auth: [Clerk](https://clerk.com/)
- Payments: [Stripe](https://stripe.com/)

**Note**: While I _highly_ recommend using o1-pro for this workflow, you can also use o3-mini, Claude 3.5 Sonnet, Gemini 2.0 Pro, and DeepSeek r1 for cheaper alternatives. However, you _will_ run into issues with those other models in this particular workflow, so I recommend using o1-pro for this workflow if possible.

## Prerequisites

You will need accounts for the following services.

They all have free plans that you can use to get started, with the exception of ChatGPT Pro (if you are using o1-pro).

- Create a [Cursor](https://www.cursor.com/) account
- Create a [GitHub](https://github.com/) account
- Create a [Supabase](https://supabase.com/) account
- Create a [Clerk](https://clerk.com/) account
- Create a [Stripe](https://stripe.com/) account
- Create a [Vercel](https://vercel.com/) account

You will likely not need paid plans unless you are building a business.

## Guide

### Clone the repo

1. Clone this repo:

```bash
git clone https://github.com/mckaywrigley/o1-pro-template-system o1-pro-project
```

2. Save the original remote as "upstream" before removing it:

```bash
git remote rename origin upstream
```

3. Create a new repository on GitHub

4. Add the new repository as "origin":

```bash
git remote add origin https://github.com/your-username/your-repo-name.git
```

5. Push the new repository:

```
git branch -M main
git push -u origin main
```

### Run the app

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3.  View the app on http://localhost:3000

### Follow the workshop

View the full workshop on [X](https://x.com/mckaywrigley/status/1891544731496206365) and [YouTube](https://www.youtube.com/watch?v=Y4n_p9w8pGY).

Or sign up for [Takeoff](https://www.jointakeoff.com/) to get access to the full workshop in course form.

## OCR with AWS Textract

Splitify includes receipt scanning functionality powered by AWS Textract. This allows users to upload receipts and have them automatically processed to extract important information like:

- Merchant name
- Date
- Total amount
- Tax and tip amounts
- Individual line items with prices and quantities

### Setting Up AWS Textract

To use the OCR functionality, you need to set up AWS Textract:

1. **Create an AWS account** if you don't have one at [aws.amazon.com](https://aws.amazon.com/)

2. **Create an IAM user with Textract permissions**:
   - Go to the AWS IAM console
   - Create a new user with programmatic access
   - Attach the `AmazonTextractFullAccess` policy
   - Save the Access Key ID and Secret Access Key

3. **Add credentials to your environment variables**:
   - Add the following to your `.env.local` file:
   ```
   AWS_TEXTRACT_ACCESS_KEY=your_access_key_id
   AWS_TEXTRACT_SECRET_KEY=your_secret_access_key
   AWS_TEXTRACT_REGION=your_preferred_region (e.g., us-east-1)
   ```

4. **Test the OCR functionality**:
   - Upload a receipt image through the app
   - The receipt should be processed automatically and the extracted data displayed

### Understanding OCR Limitations

AWS Textract provides high-quality OCR for receipt processing, but it's important to understand some limitations:

- Textract works best with clear, high-resolution images
- Poor lighting, blurry images, or unusual receipt formats may lead to less accurate results
- Users can always review and correct the extracted information manually

### Usage in the Application

The OCR functionality is implemented in these key files:

- `actions/ocr-actions.ts`: Contains the core OCR processing logic
- `actions/db/receipts-actions.ts`: Manages receipt database operations
- `types/receipt-types.ts`: Defines types for OCR data

### OCR Processing Flow

1. User uploads a receipt image when creating/editing an expense
2. Image is stored in Supabase Storage
3. The OCR process is triggered which:
   - Updates receipt status to "processing"
   - Sends the image to AWS Textract
   - Parses the response to extract structured data
   - Updates the receipt record with extracted data
4. User can review and correct the extracted data if needed
