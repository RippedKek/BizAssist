# 🚀 BizAssist

**BizAssist** is an AI-powered platform that helps entrepreneurs transform their business ideas into professional, investor-ready pitch decks. From idea analysis to visual branding and pitch practice, BizAssist provides a complete suite of tools to help you create compelling business presentations.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Backend API Routes](#backend-api-routes)
- [Frontend Pages](#frontend-pages)
- [Key Features Explained](#key-features-explained)
- [Pricing Plans](#pricing-plans)

## ✨ Features

### 1. **Idea Summarization**

- Input your raw business idea
- AI generates a professional, concise summary
- Optimized for Bangladesh market insights
- One-paragraph format for clarity

### 2. **Market Analysis Dashboard**

- AI-generated market insights
- Target market identification
- Market opportunity analysis
- Interactive chatbot for market queries
- Geographic market visualization (Bangladesh districts)

### 3. **Idea Ranking & Scoring**

- Comprehensive idea evaluation across multiple dimensions:
  - Market Potential
  - Feasibility
  - Innovation
  - Scalability
  - Profitability
- Competitor analysis
- Strengths and weaknesses assessment
- Interactive chatbot for detailed insights

### 4. **Business Name Generator**

- AI-generated business name suggestions
- Multiple creative options
- Market-appropriate naming

### 5. **Pitch Speech Generation**

- Customizable pitch speech with time limits
- Multiple sections:
  - Introduction
  - Problem Statement
  - Solution
  - Target Market
  - Business Model
  - Revenue Streams
  - Competitive Advantage
  - Team
  - Financial Projections
  - Ask/Call to Action
- Notes and timing for each section
- Professional speech formatting

### 6. **Visual Branding**

- AI-generated logo concepts (4 variations)
- Color palette generation based on business identity
- Logo selection and customization
- Real-time pitch deck preview
- Cloudinary integration for logo storage

### 7. **Slide Generation**

- AI-generated presentation slides
- HTML/CSS-based slide design
- Customizable content and styling
- Brand color integration

### 8. **Pitch Practice**

- Voice recording for pitch practice
- AI-powered assessment and feedback
- Slide-by-slide timing analysis
- Improvement suggestions
- Performance metrics

### 9. **Pitch Dashboard**

- View all your pitches
- Export pitch decks (PDF, PowerPoint)
- Download market analysis reports
- Download idea ranking reports
- Manage multiple pitches

### 10. **User Authentication**

- Firebase Authentication
- Email/Password login
- User account management
- Plan-based access control (Basic, Pro, Enterprise)

### 11. **Pricing Plans**

- **Basic (Free)**: Idea summarizer, Basic market analysis, 1 project, Community support
- **Pro (৳ 500/month)**: All Basic features, Advanced market analysis, Idea ranking & pitch generation, 5 projects, Priority support
- **Enterprise (৳ 2000/month)**: All Pro features, Visual branding, Pitch practice with feedback, Unlimited projects, Dedicated support

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **UI Icons**: Lucide React
- **Maps**: Leaflet & React Leaflet
- **PDF Generation**: jsPDF & jsPDF AutoTable
- **Presentation**: pptxgenjs
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Image Storage**: Cloudinary

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **AI Service**: Google Gemini AI (gemini-2.5-flash-lite)
- **File Upload**: Multer
- **CORS**: Express CORS middleware

## 📁 Project Structure

```
BizAssist/
├── bizassist-frontend/          # Next.js frontend application
│   ├── app/                     # Next.js app directory
│   │   ├── components/          # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── layout/         # Layout components (Navbar)
│   │   │   └── features/       # Feature-specific components
│   │   ├── firebase/           # Firebase configuration and utilities
│   │   ├── redux/              # Redux store and slices
│   │   ├── utils/              # Utility functions (Cloudinary)
│   │   ├── homepage/           # Home page
│   │   ├── input-idea/         # Idea input page
│   │   ├── market-dashboard/   # Market analysis dashboard
│   │   ├── idea-ranker/        # Idea ranking page
│   │   ├── pitch-generator/    # Pitch speech generator
│   │   ├── visual-branding/    # Visual branding page
│   │   ├── slide-generator/    # Slide generation page
│   │   ├── pitch-practise/     # Pitch practice page
│   │   ├── pitch-dashboard/    # Pitch management dashboard
│   │   ├── pitch-list/         # List of all pitches
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   └── package.json
│
└── bizassist-backend/           # Express.js backend API
    ├── controllers/             # Route controllers
    │   ├── ideaController.js
    │   ├── chatbotController.js
    │   ├── pitchPracticeController.js
    │   └── healthController.js
    ├── routes/                  # API routes
    │   ├── ideaRoutes.js
    │   ├── chatbotRoutes.js
    │   ├── pitchPracticeRoutes.js
    │   └── healthRoutes.js
    ├── services/                # Business logic services
    │   ├── geminiService.js
    │   ├── paletteService.js
    │   └── pitchPracticeService.js
    ├── middleware/              # Express middleware
    │   ├── cors.js
    │   └── errorHandler.js
    ├── app.js                   # Main application file
    └── package.json
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Firebase Account** (for authentication and database)
- **Cloudinary Account** (for image storage)
- **Google Gemini API Key** (for AI features)

## 🔐 Environment Variables

### Frontend (`.env.local`)

Create a `.env.local` file in the `bizassist-frontend` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=bizassist_unsigned

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)

Create a `.env` file in the `bizassist-backend` directory:

```env
# Server Configuration
PORT=8000
FRONTEND_URL=http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BizAssist
```

### 2. Install Frontend Dependencies

```bash
cd bizassist-frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../bizassist-backend
npm install
```

### 4. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Add the configuration to your `.env.local` file

### 5. Set Up Cloudinary

1. Create a Cloudinary account at [Cloudinary](https://cloudinary.com/)
2. Go to Settings → Upload
3. Create an unsigned upload preset named `bizassist_unsigned`
4. Configure it to allow unsigned uploads
5. Add your Cloudinary credentials to `.env.local`

### 6. Set Up Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your backend `.env` file

## 🏃 Running the Project

### Start the Backend Server

```bash
cd bizassist-backend
npm start
```

The backend server will run on `http://localhost:8000`

### Start the Frontend Development Server

```bash
cd bizassist-frontend
npm run dev
```

The frontend application will run on `http://localhost:3000`

Open browser and go to `http://localhost:3000` to access the app

## 🔌 Backend API Routes

All API routes are prefixed with `/api/v1`

### Idea Routes (`/api/v1`)

#### 1. Generate Idea Summary

- **Endpoint**: `POST /api/v1/idea-summary`
- **Description**: Generates a professional summary of a business idea
- **Request Body**:
  ```json
  {
    "idea": "Your business idea text here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "summary": "Generated summary text"
  }
  ```

#### 2. Generate Market Insights

- **Endpoint**: `POST /api/v1/market-insights`
- **Description**: Generates market analysis insights
- **Request Body**:
  ```json
  {
    "summary": "Business idea summary"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "insights": {
      /* Market insights object */
    }
  }
  ```

#### 3. Generate Idea Ranker Score

- **Endpoint**: `POST /api/v1/idea-ranker`
- **Description**: Evaluates business idea across multiple dimensions
- **Request Body**:
  ```json
  {
    "summary": "Business idea summary"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "scores": {
        "marketPotential": 85,
        "feasibility": 78,
        "innovation": 92,
        "scalability": 80,
        "profitability": 75
      },
      "overallScore": 82,
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  }
  ```

#### 4. Generate Competitors

- **Endpoint**: `POST /api/v1/competitors`
- **Description**: Identifies competitors in the Bangladesh market
- **Request Body**:
  ```json
  {
    "summary": "Business idea summary"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "competitors": [
        {
          "name": "Competitor Name",
          "website": "https://example.com",
          "description": "Competitor description"
        }
      ]
    }
  }
  ```

#### 5. Generate Business Names

- **Endpoint**: `POST /api/v1/business-names`
- **Description**: Generates business name suggestions
- **Request Body**:
  ```json
  {
    "summary": "Business idea summary"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "names": ["Name 1", "Name 2", "Name 3"]
    }
  }
  ```

#### 6. Generate Pitch Speech

- **Endpoint**: `POST /api/v1/pitch-speech`
- **Description**: Generates a structured pitch speech with sections
- **Request Body**:
  ```json
  {
    "summary": "Business idea summary",
    "businessTitle": "Business Name",
    "selectedSections": ["intro", "problem", "solution"],
    "timeLimit": 5,
    "additionalInfo": "Optional additional information"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "sections": [
        {
          "sectionName": "Introduction",
          "content": "Speech content",
          "timeMinutes": 1,
          "timeSeconds": 30,
          "notes": "Speaker notes"
        }
      ],
      "totalTimeMinutes": 5,
      "totalTimeSeconds": 0
    }
  }
  ```

#### 7. Generate Slide

- **Endpoint**: `POST /api/v1/generate-slide`
- **Description**: Generates HTML/CSS code for a presentation slide
- **Request Body**:
  ```json
  {
    "sectionName": "Problem Statement",
    "sectionContent": "Content for the slide",
    "businessTitle": "Business Name",
    "summary": "Business summary",
    "slideNumber": 1,
    "totalSlides": 10
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "slideCode": "<div>...</div>"
    }
  }
  ```

#### 8. Generate Color Palettes

- **Endpoint**: `POST /api/v1/generate-palettes`
- **Description**: Generates color palettes for visual branding
- **Request Body**:
  ```json
  {
    "businessName": "Business Name",
    "summary": "Business summary",
    "logoColors": ["#5B5FEF", "#10B981"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "palettes": [
        {
          "name": "Palette Name",
          "colors": ["#5B5FEF", "#10B981", "#F59E0B"],
          "description": "Palette description"
        }
      ]
    }
  }
  ```

### Chatbot Routes (`/api/v1/chatbot`)

#### 1. Market Chatbot

- **Endpoint**: `POST /api/v1/chatbot/chat`
- **Description**: AI chatbot for market analysis queries
- **Request Body**:
  ```json
  {
    "message": "User message",
    "marketInsights": {
      /* Market insights object */
    },
    "conversationHistory": []
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "response": "AI response text"
  }
  ```

#### 2. Idea Ranker Chatbot

- **Endpoint**: `POST /api/v1/chatbot/idea-ranker-chat`
- **Description**: AI chatbot for idea ranking queries
- **Request Body**:
  ```json
  {
    "message": "User message",
    "rankerData": {
      /* Ranker data object */
    },
    "competitors": [
      /* Competitors array */
    ],
    "conversationHistory": []
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "response": "AI response text"
  }
  ```

### Pitch Practice Routes (`/api/v1/pitch-practice`)

#### 1. Assess Pitch Practice

- **Endpoint**: `POST /api/v1/pitch-practice/assess`
- **Description**: Analyzes recorded pitch practice audio
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `audio`: Audio file (multipart file)
  - `slideBoundaries`: JSON string of slide boundaries
  - `totalSlides`: Number (total slides)
  - `referencePitch`: JSON string of reference pitch data
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "perSlide": [
        {
          "slideIndex": 1,
          "durationMs": 45000,
          "wordCount": 120,
          "assessment": {
            "feedback": "Feedback text",
            "mark": 85,
            "suggestions": ["Suggestion 1"]
          }
        }
      ],
      "overallMark": 82,
      "totalTimeMs": 300000,
      "averageWPM": 150
    }
  }
  ```

### Health Routes (`/api/v1`)

#### 1. Health Check

- **Endpoint**: `GET /api/v1/health`
- **Description**: Checks if the server is running
- **Response**:
  ```json
  {
    "success": true,
    "message": "Server is healthy"
  }
  ```

## 📱 Frontend Pages

### 1. **Home Page** (`/homepage`)

- Main dashboard after login
- Overview of all features
- Quick access to create new pitch
- Navigation to all sections

### 2. **Input Idea** (`/input-idea`)

- Input raw business idea
- Generate AI summary
- Select or create business name
- Save idea to Firebase

### 3. **Market Dashboard** (`/market-dashboard`)

- Display market insights
- Interactive map visualization (Bangladesh districts)
- Market statistics and charts
- Interactive chatbot for queries
- Export market analysis reports

### 4. **Idea Ranker** (`/idea-ranker`)

- Display idea scores across dimensions
- Competitor analysis
- Strengths and weaknesses
- Interactive chatbot for insights
- Visual score representations

### 5. **Pitch Generator** (`/pitch-generator`)

- Select pitch sections
- Set time limits
- Generate pitch speech
- Edit and customize content
- Speaker notes and timing

### 6. **Visual Branding** (`/visual-branding`)

- Generate logo concepts (4 variations)
- Select logo design
- Generate color palettes
- Preview pitch deck with branding
- Save branding to Firebase

### 7. **Slide Generator** (`/slide-generator`)

- Generate individual slides
- Customize slide content
- Apply brand colors
- Preview slides
- Export slides

### 8. **Pitch Practice** (`/pitch-practise`)

- Record pitch practice
- Upload audio file
- AI assessment and feedback
- Slide-by-slide analysis
- Performance metrics

### 9. **Pitch Dashboard** (`/pitch-dashboard`)

- View detailed pitch information
- Display pitch logo and branding
- Export pitch deck (PDF, PowerPoint)
- Download reports
- Manage pitch settings
- Delete pitch

### 10. **Pitch List** (`/pitch-list`)

- List all user pitches
- Filter and search pitches
- Navigate to pitch details
- Create new pitch

### 11. **Login** (`/login`)

- User authentication
- Email/password login
- Redirect to homepage after login

### 12. **Signup** (`/signup`)

- User registration
- Create new account
- Set account type to "basic" by default
- Redirect to homepage after signup

## 🔑 Key Features Explained

### User Authentication & Authorization

- Firebase Authentication handles user login/signup
- User accounts stored in Firestore (`users` collection)
- Account types: `basic`, `pro`, `enterprise`
- Protected routes require authentication
- Plan-based feature access control

### Firebase Data Structure

#### Users Collection

```
users/{email}
  - name: string
  - account: "basic" | "pro" | "enterprise"
  - pitches: string[] (array of pitch IDs)
```

#### Pitches Collection

```
pitches/{pitchId}
  - user: { uid: string, email: string }
  - businessTitle: string
  - summary: string
  - status: "draft" | "in_progress" | "completed"
  - currentStep: string
  - draftIdea: object
  - marketAnalysis: object
  - ideaRanking: object
  - pitchGeneration: object
  - visualBranding: {
      selectedLogo: number
      selectedPalette: number
      logo: { image: string, ... }
      palette: { name: string, colors: string[] }
    }
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### Cloudinary Integration

- Logo images uploaded to Cloudinary on selection
- Stored in `bizassist/logos/{business-name}` folder
- URLs stored in Firebase for later retrieval
- Unsigned upload preset for client-side uploads

### AI Services

- **Google Gemini AI**: All AI-powered features use Gemini 2.5 Flash Lite model
- **Market Analysis**: Context-aware insights for Bangladesh market
- **Idea Ranking**: Multi-dimensional evaluation system
- **Speech Generation**: Structured pitch speeches with timing
- **Slide Generation**: HTML/CSS code generation for slides
- **Chatbot**: Context-aware conversational AI

### Export Features

- **PDF Export**: jsPDF for generating PDF documents
- **PowerPoint Export**: pptxgenjs for .pptx files
- **Market Reports**: Formatted PDF reports
- **Idea Ranking Reports**: Detailed evaluation reports

## 📊 Pricing Plans

### Basic (Free)

- ✅ Idea summarizer
- ✅ Basic market analysis
- ✅ 1 project
- ✅ Community support

### Pro (৳ 500/month)

- ✅ All Basic features
- ✅ Advanced market analysis
- ✅ Idea ranking & pitch generation
- ✅ 5 projects
- ✅ Priority support

### Enterprise (৳ 2000/month)

- ✅ All Pro features
- ✅ Visual branding
- ✅ Pitch practice with feedback
- ✅ Unlimited projects
- ✅ Dedicated support

Users can upgrade their plan through the Upgrade button in the navbar, which opens a pricing modal showing all available plans.

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**

   - Ensure Firebase configuration is correct in `.env.local`
   - Check if Authentication is enabled in Firebase Console
   - Verify Firestore rules allow read/write access

2. **API Connection Errors**

   - Ensure backend server is running on port 8000
   - Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
   - Verify CORS settings in backend allow frontend origin

3. **Cloudinary Upload Errors**

   - Ensure unsigned upload preset is created
   - Check Cloudinary credentials in `.env.local`
   - Verify upload preset name matches configuration

4. **AI Generation Errors**
   - Verify Gemini API key is set in backend `.env`
   - Check API quota and limits
   - Ensure stable internet connection

## 📝 Development Notes

### Frontend

- Uses Next.js App Router
- Server-side rendering where applicable
- Client components marked with `'use client'`
- Redux for global state management
- Firebase real-time listeners for auth state

### Backend

- Express.js REST API
- Error handling middleware
- CORS enabled for frontend
- Multer for file uploads
- Async/await pattern throughout

### Code Style

- TypeScript for frontend type safety
- ESLint for code quality
- Consistent naming conventions
- Modular component structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under ISC License.

## 👥 Team

Developed by **Team ULTRON**

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini AI](https://ai.google.dev/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Note**: Make sure all environment variables are properly configured before running the application. The backend must be running before starting the frontend for full functionality.
