# Gaming E-Commerce Backend

Production-ready backend for a digital gaming and subscription e-commerce platform.

## Features

- ✅ User authentication with email verification
- ✅ Role-based access control (User/Admin)
- ✅ Product & category management
- ✅ Shopping cart with promo codes
- ✅ Order processing
- ✅ Manual payment confirmation with proof upload
- ✅ Email notifications
- ✅ Dynamic content management (banners, featured products)
- ✅ RESTful API
- ✅ Input validation & security

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Email:** Nodemailer
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `EMAIL_USER` / `EMAIL_PASSWORD` - Email credentials
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Default admin account

### 3. Start Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

### 4. Create Admin (Optional)

```bash
npm run create-admin
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `PUT /api/users/change-password` - Change password (Protected)
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id/role` - Update user role (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Products
- `GET /api/products` - Get products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart (Protected, Verified)
- `POST /api/cart` - Add to cart (Protected, Verified)
- `PUT /api/cart/:itemId` - Update cart item (Protected, Verified)
- `DELETE /api/cart/:itemId` - Remove from cart (Protected, Verified)
- `POST /api/cart/promo-code` - Apply promo code (Protected, Verified)

### Orders
- `POST /api/orders` - Create order (Protected, Verified)
- `GET /api/orders` - Get user orders (Protected, Verified)
- `GET /api/orders/:id` - Get order details (Protected, Verified)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `PATCH /api/orders/:id/cancel` - Cancel order (Protected, Verified)

### Payments
- `POST /api/payments` - Submit payment (Protected, Verified)
- `GET /api/payments/:orderId` - Get payment status (Protected, Verified)
- `GET /api/payments` - Get all payments (Admin)
- `PATCH /api/payments/:id/confirm` - Confirm payment (Admin)
- `PATCH /api/payments/:id/reject` - Reject payment (Admin)

### Promo Codes
- `POST /api/promo-codes/validate` - Validate promo code (Protected, Verified)
- `GET /api/promo-codes` - Get all promo codes (Admin)
- `POST /api/promo-codes` - Create promo code (Admin)
- `PUT /api/promo-codes/:id` - Update promo code (Admin)
- `DELETE /api/promo-codes/:id` - Delete promo code (Admin)

### Content
- `GET /api/content/banners` - Get banners
- `POST /api/content/banners` - Create banner (Admin)
- `PUT /api/content/banners/:id` - Update banner (Admin)
- `DELETE /api/content/banners/:id` - Delete banner (Admin)
- `GET /api/content/featured` - Get featured products
- `POST /api/content/featured` - Add featured product (Admin)
- `DELETE /api/content/featured/:id` - Remove featured product (Admin)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database & email configuration
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── scripts/         # Utility scripts
│   └── app.js           # Express app setup
├── uploads/             # File uploads
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
└── server.js            # Entry point
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Email verification required
- Role-based access control
- Input validation
- Rate limiting
- Helmet security headers
- CORS protection
- File upload restrictions

## License

ISC
