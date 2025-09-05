# Raindrop Chat Setup

## Environment Configuration

To run this application, you need to set up your environment variables:

### 1. Create Environment File

Create a `.env.local` file in the root directory with the following content:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Raindrop AI Configuration (optional)
RAINDROP_API_KEY=your_raindrop_api_key_here
```

### 2. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and replace `your_actual_openai_api_key_here` in your `.env.local` file

### 3. Run the Application

```bash
npm run dev
```

## Troubleshooting

If you see the error "OpenAI API key not configured", make sure:
- You have created a `.env.local` file
- The file contains your actual OpenAI API key
- The file is in the root directory of the project
- You have restarted the development server after adding the environment variables

## Security Note

Never commit your `.env.local` file to version control. It contains sensitive API keys.
