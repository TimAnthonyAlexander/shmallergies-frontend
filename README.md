# Shmallergies Frontend

A modern React TypeScript application for allergen tracking and product safety management. This frontend provides an intuitive interface for users to manage their allergies, search products, upload new items, and get personalized safety recommendations.

## Features

- **Modern UI/UX** with Material UI components and responsive design
- **User Authentication** with email verification flow
- **Product Discovery** - search and browse community database
- **AI-Powered Uploads** - submit products with ingredient photo analysis
- **Personal Safety Checks** - real-time allergen warnings
- **Allergy Management** - track and manage personal allergies
- **Community Database** - access publicly available product information
- **Real-time Updates** - instant safety alerts and product information

## Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI (MUI) 5.x
- **Routing**: React Router v6
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: Custom API client with Axios-like interface
- **Styling**: CSS-in-JS with MUI's sx prop system
- **Icons**: Material Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx          # Navigation header
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   ├── UI/
│   │   │   ├── ErrorMessage.tsx    # Error display component
│   │   │   └── LoadingSpinner.tsx  # Loading indicators
│   │   └── ProtectedRoute.tsx      # Route protection
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication state management
│   ├── lib/
│   │   └── api.ts                  # API client and endpoints
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── Login.tsx               # User login
│   │   ├── Signup.tsx              # User registration
│   │   ├── EmailVerification.tsx   # Email verification flow
│   │   ├── Products.tsx            # Product listing and search
│   │   ├── ProductDetail.tsx       # Individual product view
│   │   ├── UploadProduct.tsx       # Product upload form
│   │   └── Profile.tsx             # User profile and allergy management
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles
├── public/
│   └── vite.svg                    # App icon
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # This file
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Running Shmallergies API backend
- Modern web browser

### Installation Steps

1. **Navigate to frontend directory and install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```bash
   # API Configuration
   VITE_API_BASE_URL=http://shmallergies.test:2811/api
   VITE_API_STORAGE_URL=http://shmallergies.test:2811
   
   # App Configuration
   VITE_APP_NAME=Shmallergies
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## Core Features

### 1. Authentication System
- **User Registration** with email verification
- **Secure Login** with token-based authentication
- **Email Verification Flow** with resend capability
- **Protected Routes** for authenticated features
- **Automatic Token Management** with context state

```typescript
// AuthContext provides authentication state
const { isAuthenticated, user, login, signup, logout } = useAuth();
```

### 2. Product Management
- **Product Search** by name or UPC code
- **Paginated Browsing** with filtering options
- **Detailed Product Views** with ingredient breakdown
- **AI-Powered Upload** with image processing
- **Real-time Safety Checks** against user allergies

### 3. Safety Features
- **Personal Allergy Profiles** with CRUD operations
- **Instant Safety Warnings** on product pages
- **Allergen Conflict Detection** with visual indicators
- **Safety Status Indicators** (safe/warning/danger)

### 4. User Experience
- **Responsive Design** optimized for all devices
- **Modern Material Design** with consistent theming
- **Loading States** and error handling
- **Accessible Components** following WCAG guidelines
- **Progressive Enhancement** with offline-first approach

## API Integration

The frontend communicates with the Laravel backend through a custom API client:

```typescript
// API Client Usage Examples
import { apiClient } from '../lib/api';

// Authentication
await apiClient.login(email, password);
await apiClient.signup(name, email, password, passwordConfirmation);

// Products
const products = await apiClient.getProducts(page, perPage);
const product = await apiClient.getProduct(id);
const searchResults = await apiClient.searchProducts(query);

// Safety Checks
const safetyCheck = await apiClient.checkProductSafety(productId);

// User Allergies
const allergies = await apiClient.getUserAllergies();
await apiClient.addUserAllergy(allergyText);
```

## Component Architecture

### Layout Components
- **Layout.tsx**: Main application shell with header and navigation
- **Header.tsx**: Top navigation with authentication and user menu
- **ProtectedRoute.tsx**: Route wrapper for authenticated pages

### UI Components
- **ErrorMessage.tsx**: Standardized error display with dismissal
- **LoadingSpinner.tsx**: Consistent loading indicators in multiple sizes

### Page Components
All pages follow consistent patterns:
- Loading states with spinners
- Error handling with user-friendly messages
- Responsive layouts with Material UI Grid
- Form validation with real-time feedback
- Success states with actionable next steps

## Styling & Theming

### Material UI Theme
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },      // Blue-600
    secondary: { main: '#7c3aed' },    // Purple-600
    background: {
      default: '#f9fafb',             // Light gray
      paper: '#ffffff'                // White
    }
  },
  typography: {
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI"'
  }
});
```

### Design System
- **Green Theme**: Primary actions and safety indicators (#10B981)
- **Consistent Spacing**: 8px grid system
- **Typography Hierarchy**: Clear heading and body text scales
- **Color Semantics**: Red for allergens, green for safety, blue for info
- **Rounded Corners**: 8-16px border radius for modern feel

## State Management

### AuthContext
Manages global authentication state:
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<SignupResult>;
  logout: () => void;
  isLoading: boolean;
}
```

### Local State Patterns
- **Loading States**: Boolean flags for async operations
- **Error Handling**: Structured error objects with messages and field errors
- **Form State**: Controlled components with validation
- **UI State**: Modal visibility, pagination, search filters

## User Flows

### 1. New User Registration
1. **Signup Form** → Email verification sent
2. **Email Verification** → Account activated
3. **Profile Setup** → Add personal allergies
4. **Product Search** → Check safety recommendations

### 2. Product Discovery
1. **Search/Browse** → Find products of interest
2. **Product Details** → View ingredients and allergens
3. **Safety Check** → See personalized warnings
4. **Upload Missing** → Contribute to database

### 3. Product Upload
1. **Upload Form** → Product name and UPC
2. **Image Upload** → Ingredient list photo
3. **AI Processing** → Automatic allergen detection
4. **Community Benefit** → Database enrichment

## Error Handling

### API Error Management
```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Validation errors
  status?: number;                   // HTTP status code
}
```

### User-Friendly Messages
- **Validation Errors**: Field-specific error messages
- **Network Errors**: Connection and timeout handling
- **Authentication Errors**: Token expiry and verification issues
- **Not Found Errors**: Graceful 404 handling with navigation options

## Performance Optimizations

### Code Splitting
- **Lazy Loading**: Dynamic imports for page components
- **Route-based Splitting**: Separate bundles per route
- **Component Bundling**: Efficient chunk distribution

### Image Optimization
- **Lazy Loading**: Images load on scroll
- **Responsive Images**: Multiple sizes for different viewports
- **Placeholder States**: Skeleton loading for better UX

### API Optimization
- **Request Caching**: Avoid duplicate API calls
- **Debounced Search**: Reduce search API calls
- **Pagination**: Load data in manageable chunks

## Testing

### Test Structure
```bash
npm run test        # Run unit tests
npm run test:watch  # Watch mode for development
npm run test:ui     # Visual test runner
```

### Testing Patterns
- **Component Testing**: React Testing Library
- **API Mocking**: MSW for API responses
- **User Flow Testing**: Cypress for E2E tests
- **Accessibility Testing**: Automated a11y checks

## Deployment

### Build Configuration
```bash
# Production build
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables
```bash
# Production Environment
VITE_API_BASE_URL=https://api.shmallergies.com/api
VITE_API_STORAGE_URL=https://api.shmallergies.com
VITE_APP_NAME=Shmallergies
```

### Deployment Targets
- **Static Hosting**: Netlify, Vercel, AWS S3
- **CDN Integration**: CloudFront, Cloudflare
- **Docker**: Containerized deployment option

## Security Considerations

### Authentication Security
- **Token Storage**: Secure localStorage management
- **CSRF Protection**: API request headers
- **Route Protection**: Authenticated route guards
- **Auto Logout**: Token expiry handling

### Data Validation
- **Input Sanitization**: XSS prevention
- **Type Safety**: TypeScript compile-time checks
- **API Validation**: Server-side validation integration
- **File Upload Security**: Image type and size validation

## Contributing

### Development Workflow
1. **Fork Repository** and create feature branch
2. **Install Dependencies** with `npm install`
3. **Start Dev Server** with `npm run dev`
4. **Write Tests** for new functionality
5. **Run Linter** with `npm run lint`
6. **Submit Pull Request** with detailed description

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Consistent code formatting
- **Component Patterns**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality without JavaScript
- **Responsive Design**: Mobile-first approach

## Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Logical tab order

### Inclusive Design
- **Font Scaling**: Respects user font size preferences
- **Reduced Motion**: Honors prefers-reduced-motion
- **High Contrast**: System theme support
- **Language Support**: Semantic HTML lang attributes

## License

This project is open source and available under the MIT License.
