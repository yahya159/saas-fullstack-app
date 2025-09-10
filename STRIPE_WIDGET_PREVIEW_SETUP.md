# Stripe Widget Preview Payment Integration

## Overview
This document explains how to set up and use the Stripe payment integration for widget previews in the SaaS application.

## Setup Instructions

### 1. Backend Configuration

1. **Install Dependencies**:
   ```bash
   cd saas-app-backend
   npm install stripe dotenv
   ```

2. **Configure Environment Variables**:
   Create or update the `.env` file in the `saas-app-backend` directory:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

3. **Verify Installation**:
   The backend should now have the required dependencies and configuration.

### 2. Frontend Configuration

1. **Install Dependencies**:
   ```bash
   cd saas-app-frontend
   npm install @stripe/stripe-js
   ```

2. **Update Environment Configuration**:
   Update `src/environments.ts` with your Stripe publishable key:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     stripe: {
       publishableKey: 'pk_test_your_publishable_key_here'
     }
   };
   ```

### 3. Testing the Integration

1. **Start the Backend**:
   ```bash
   cd saas-app-backend
   npm run start
   ```

2. **Start the Frontend**:
   ```bash
   cd saas-app-frontend
   npm run start
   ```

3. **Create a Widget**:
   - Navigate to the widget builder
   - Create a new widget or select an existing one
   - Click the "Preview" button

4. **Test Payment Flow**:
   - On the preview page, you should see a "Pay $5.00 to Preview" button
   - Click the button to be redirected to Stripe Checkout
   - Use Stripe's test card numbers (e.g., 4242 4242 4242 4242) to complete the payment
   - After successful payment, you'll be redirected back to the preview page
   - The widget preview should now be visible

## API Endpoints

### Create Checkout Session
- **URL**: `POST /api/widgets/preview-payment/create-checkout-session`
- **Body**:
  ```json
  {
    "widgetId": "widget_id_here",
    "successUrl": "http://example.com/success",
    "cancelUrl": "http://example.com/cancel"
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": "stripe_session_id",
    "url": "https://checkout.stripe.com/pay/..."
  }
  ```

### Verify Payment
- **URL**: `GET /api/widgets/preview-payment/verify-payment?sessionId=stripe_session_id`
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Customization

### Pricing
The current implementation uses a fixed price of $5.00 for all widget previews. To customize pricing:

1. **Backend**: Modify `WidgetPreviewPaymentController` to accept a dynamic amount
2. **Frontend**: Update the payment button to display the correct price

### Widget-Specific Pricing
To implement widget-specific pricing:

1. Add a `previewPrice` field to the widget model
2. Update the widget service to include this field when creating checkout sessions
3. Modify the frontend to display the widget-specific price

## Security Considerations

1. **Environment Variables**: Never commit real Stripe keys to version control
2. **Webhook Verification**: For production, implement Stripe webhook verification
3. **Payment Verification**: Always verify payments server-side before granting access

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY is required" Error**:
   - Ensure the `.env` file exists in the backend directory
   - Verify the `STRIPE_SECRET_KEY` variable is correctly set

2. **CORS Issues**:
   - Check that the frontend URL is allowed in the backend CORS configuration

3. **Payment Not Redirecting**:
   - Verify the Stripe keys are correct
   - Check browser console for JavaScript errors

### Logs
Check the backend logs for detailed error messages:
```bash
cd saas-app-backend
npm run start
# Look for error messages in the console output
```