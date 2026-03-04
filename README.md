# Seekon Apparel - E-commerce Frontend

A modern, responsive e-commerce frontend built with React, Vite, TailwindCSS, Redux Toolkit, and React Router DOM. This application provides a premium shopping experience for sneakers and apparel, inspired by top brands like Nike, Adidas, and Converse.

## 🚀 Features

### 🛍️ Shopping Experience
- **Product Catalog**: Browse products by category, brand, price, and more
- **Product Details**: Detailed product pages with image galleries, size/color selection
- **Shopping Cart**: Persistent cart with quantity management and real-time updates
- **Checkout Process**: Secure checkout flow with order confirmation

### 👤 User Management
- **Authentication**: Login and registration with form validation
- **User Profiles**: Personalized user experience
- **Order History**: Track and view past orders
- **Role-based Access**: Admin dashboard for store management

### 🎨 Design & UX
- **Modern UI**: Clean, minimal design inspired by premium brands
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Smooth Animations**: Framer Motion animations for enhanced user experience

### 🤖 AI Assistant
- **Chat Widget**: Floating AI assistant for shopping help
- **Personalized Greetings**: Context-aware conversations
- **Product Recommendations**: AI-powered suggestions
- **Mock Integration**: Ready for OpenAI API integration

### 📱 Technical Features
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router DOM with protected routes
- **API Integration**: Mock API with real-world patterns
- **Performance**: Optimized with Vite and code splitting

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: React Icons
- **HTTP Client**: Axios
- **Development**: ESLint, Prettier

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seekon-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🎯 Demo Credentials

### Admin Account
- **Email**: admin@seekon.com
- **Password**: admin123
- **Access**: Full admin dashboard

### User Account
- **Email**: user@seekon.com
- **Password**: user123
- **Access**: Standard user features

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar with user menu
│   ├── Footer.jsx      # Site footer with links
│   ├── ProductCard.jsx # Product display card
│   ├── HeroBanner.jsx  # Homepage hero section
│   ├── CartDrawer.jsx  # Shopping cart sidebar
│   ├── FilterBar.jsx   # Product filtering
│   └── AIChatAssistant.jsx # AI chat widget
├── pages/              # Page components
│   ├── Home.jsx        # Homepage with product sections
│   ├── Login.jsx       # User login
│   ├── Register.jsx    # User registration
│   ├── Collection.jsx   # Product catalog
│   ├── ProductDetail.jsx # Individual product page
│   ├── Cart.jsx        # Shopping cart
│   ├── Checkout.jsx    # Checkout process
│   ├── Orders.jsx      # Order history
│   └── AdminDashboard.jsx # Admin panel
├── store/              # Redux store configuration
│   ├── store.js        # Store setup
│   └── slices/         # Redux slices
│       ├── userSlice.js    # User authentication
│       ├── productSlice.js # Product management
│       └── cartSlice.js    # Shopping cart
├── context/            # React contexts
│   └── AuthContext.jsx # Authentication context
├── utils/              # Utility functions
│   ├── api.js          # API functions
│   └── formatPrice.js  # Price formatting utilities
├── App.jsx             # Main app component with routing
└── main.jsx           # Application entry point
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Secondary**: Gray scale (#64748b to #0f172a)
- **Accent**: Red for sales/discounts (#ef4444)
- **Success**: Green for positive actions (#10b981)
- **Warning**: Yellow for alerts (#f59e0b)

### Typography
- **Headings**: Poppins (display font)
- **Body**: Inter (system font)
- **Sizes**: Responsive scale from 12px to 48px

### Components
- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: Consistent shadow and border radius
- **Forms**: Accessible input fields with validation
- **Navigation**: Sticky header with mobile menu

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

Build the project:
```bash
npm run build
```

The `dist` folder contains the production-ready files.

## 🔮 Future Enhancements

- [ ] Real API integration
- [ ] Payment processing (Stripe)
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Inventory management

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please contact:
- Email: support@seekon-apparel.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

Built with ❤️ for sneaker and apparel enthusiasts.

