# 📈 Stock Tracker - Full-Stack Investment Portfolio Management

A modern, full-stack web application for tracking stocks, analyzing market data, and managing investment portfolios. Built with cutting-edge technologies and real-time market data integration.

## 🚀 Live Demo

[Add your deployed application URL here]

## ✨ Key Features

### 📊 Real-Time Stock Data & Visualization
- **Interactive Charts**: Dynamic stock price charts using Chart.js with custom plugins
- **Multiple Timeframes**: View stock data from 1 day to 5 years with various intervals
- **Real-time Data**: Live market data from Alpaca Markets API
- **Interactive Crosshairs**: Hover effects for precise price reading

### 🔍 Advanced Stock Search
- **Autocomplete Search**: Real-time stock symbol suggestions
- **Debounced API Calls**: Optimized performance with 300ms debouncing
- **Company Information**: Detailed company profiles from Yahoo Finance API
- **CEO & Company Details**: Executive information and company statistics

### 👤 User Authentication & Portfolio Management
- **Google OAuth Integration**: Secure authentication with NextAuth.js
- **Portfolio Tracking**: Save and manage your stock purchases
- **Flexible Purchase Options**: Buy by shares or dollar amount
- **Real-time Price Updates**: Current market prices for portfolio valuation

### 🏗️ Modern Architecture
- **Microservices**: Separate frontend and backend services
- **RESTful APIs**: Clean API design with proper error handling
- **Database Integration**: PostgreSQL with Supabase for data persistence
- **Type Safety**: Full TypeScript implementation

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.3.2** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first CSS framework
- **Chart.js 4.4.9** - Interactive data visualization
- **NextAuth.js 4.24.11** - Authentication solution

### Backend
- **Spring Boot 3.5.0** - Java-based microservices
- **Java 21** - Latest LTS version with modern features
- **PostgreSQL** - Reliable relational database
- **Supabase** - Database hosting and management
- **Gradle** - Build automation

### APIs & External Services
- **Alpaca Markets API** - Real-time stock data and market information
- **Yahoo Finance API** - Company profiles and financial data
- **Google OAuth** - Secure user authentication

## 📁 Project Structure

```
stock-tracker/
├── frontend/                 # Next.js React application
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── interfaces/      # TypeScript interfaces
│   └── public/              # Static assets
└── backend/                 # Spring Boot application
    └── src/main/java/
        └── com/example/backend/
            ├── Stock/        # Stock management
            ├── User/         # User management
            └── config/       # Configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Java 21
- PostgreSQL database
- Alpaca Markets API key
- Google OAuth credentials

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
./gradlew bootRun
```

### Environment Variables
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ALPACA_API=your_alpaca_api_key
ALPACA_SECRET=your_alpaca_secret_key
ALPACA_URL=https://data.alpaca.markets
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🔧 Key Technical Implementations

### Real-Time Data Integration
- **Alpaca Markets API**: Real-time stock data with multiple timeframes
- **Optimized API Calls**: Efficient data fetching with proper error handling
- **Chart.js Integration**: Custom plugins for enhanced user experience

### Authentication System
- **NextAuth.js**: Secure OAuth implementation
- **Context API**: Global state management for user sessions
- **Protected Routes**: User-specific data access

## 🎯 Performance Optimizations

- **Debounced Search**: 300ms delay to reduce API calls
- **Lazy Loading**: Components load on demand
- **Caching**: Efficient data caching strategies
- **Error Boundaries**: Graceful error handling
- **TypeScript**: Compile-time error checking

## 🔒 Security Features

- **OAuth 2.0**: Secure Google authentication
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side data validation
- **SQL Injection Prevention**: Parameterized queries
- **Environment Variables**: Secure credential management

## 📈 Future Enhancements

- [ ] Portfolio performance analytics
- [ ] Real-time price alerts
- [ ] Advanced charting indicators
- [ ] Mobile responsive design
- [ ] Dark mode theme
- [ ] Export portfolio data
- [ ] Social features (share portfolios)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **LinkedIn**: linkedin.com/in/yalamber-subba-19aa01239/ 
- **GitHub**: github.com/gutsyguy
- **Email**: yalambersubba13@gmail.com 

---

**Built with ❤️ using Next.js, Spring Boot, and modern web technologies**

