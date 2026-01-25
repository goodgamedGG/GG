# Complete Admin API Documentation

This document lists ALL admin endpoints for full control over the platform.

## Base URL
All admin endpoints are prefixed with `/api/admin` and require admin authentication.

---

## 📊 Dashboard & Statistics

### Get Admin Dashboard Stats
**GET** `/api/admin/stats`

Returns comprehensive dashboard statistics including:
- Total counts (products, users, orders, payments, reviews)
- Today's stats (orders, revenue)
- This month's stats with growth percentage
- Pending items (orders, payments, reviews)
- Top products
- Recent orders

### Get Analytics Data
**GET** `/api/admin/analytics?period=30`

Returns analytics for specified period (default 30 days):
- Sales data (daily revenue and orders)
- Product performance (top 10 by sales)
- User growth (daily registrations)
- Category performance (revenue by category)

---

## 👥 User Management

### Get All Users
**GET** `/api/users?page=1&limit=20&role=user`

### Get User by ID
**GET** `/api/users/:id`

Returns user with:
- Orders count
- Loyalty points and tier
- All user details

### Update User
**PUT** `/api/users/:id`
```json
{
  "name": "New Name",
  "email": "new@email.com",
  "phone": "+1234567890",
  "isEmailVerified": true,
  "role": "admin"
}
```

### Update User Role
**PUT** `/api/users/:id/role`
```json
{
  "role": "admin"
}
```

### Delete User
**DELETE** `/api/users/:id`

### Bulk Update Users
**POST** `/api/users/bulk`
```json
{
  "userIds": ["id1", "id2"],
  "updates": {
    "isEmailVerified": true,
    "role": "user"
  }
}
```

---

## 🎮 Product Management

### Get All Products (Admin - Advanced Filters)
**GET** `/api/admin/products?page=1&limit=50&category=xxx&type=game&platform=PC&isActive=true&isFlashSale=true&isFeatured=true&minPrice=10&maxPrice=100&minStock=5&search=keyword&sort=-createdAt`

### Get Product Statistics
**GET** `/api/admin/products/stats`

Returns:
- Overview (total, active, stock, low stock, out of stock, flash sales, featured)
- Average price, total inventory value
- Statistics by category

### Toggle Product Featured Status
**PATCH** `/api/admin/products/:id/feature`

### Update Product Tags
**PATCH** `/api/admin/products/:id/tags`
```json
{
  "tags": ["action", "rpg", "multiplayer"]
}
```

### Bulk Update Products
**POST** `/api/admin/products/bulk`
```json
{
  "productIds": ["id1", "id2"],
  "updates": {
    "isActive": false,
    "isFeatured": true
  }
}
```

### Bulk Delete Products
**DELETE** `/api/admin/products/bulk`
```json
{
  "productIds": ["id1", "id2"]
}
```

---

## 📦 Order Management

### Get All Orders
**GET** `/api/orders/admin/all?page=1&limit=20&status=processing&paymentStatus=confirmed`

### Get Order Statistics
**GET** `/api/orders/admin/stats?period=30`

Returns:
- Total orders and revenue
- Status distribution
- Payment status distribution

### Update Order Status
**PATCH** `/api/orders/:id/status`
```json
{
  "status": "processing",
  "message": "Custom status message"
}
```

### Update Estimated Delivery
**PATCH** `/api/orders/:id/delivery`
```json
{
  "estimatedDelivery": "2026-02-01T00:00:00.000Z"
}
```

---

## 💳 Payment Management

### Get All Payments
**GET** `/api/payments?page=1&limit=20&status=pending`

### Confirm Payment
**PATCH** `/api/payments/:id/confirm`

### Reject Payment
**PATCH** `/api/payments/:id/reject`
```json
{
  "reason": "Payment proof unclear"
}
```

---

## 🏷️ Category Management

### Get Category Statistics
**GET** `/api/admin/categories/stats`

Returns statistics for each category:
- Total products
- Active products
- Total stock

### Bulk Update Categories
**POST** `/api/admin/categories/bulk`
```json
{
  "categoryIds": ["id1", "id2"],
  "updates": {
    "isActive": false
  }
}
```

---

## 🎟️ Promo Code Management

### Get Promo Code Statistics
**GET** `/api/admin/promo-codes/stats` (all codes)
**GET** `/api/admin/promo-codes/stats/:id` (specific code)

Returns:
- Total/active/expired codes
- Total usage
- For specific code: usage details, orders, revenue

---

## ⚡ Flash Sales Management

### Get Active Flash Sales
**GET** `/api/flash-sales`

### Create Flash Sale
**POST** `/api/flash-sales`
```json
{
  "productId": "product_id",
  "discountPrice": 29.99,
  "endsAt": "2026-01-31T23:59:59.000Z"
}
```

### End Flash Sale
**DELETE** `/api/flash-sales/:productId`

---

## 💰 Price Alerts Management

### Get All Price Alerts
**GET** `/api/admin/price-alerts?page=1&limit=50&status=active`

Returns all user price alerts with product and user details.

### Check Price Drops (Manual Trigger)
**POST** `/api/price-alerts/check`

Manually trigger price drop check and notifications.

---

## 🎁 Loyalty Points Management

### Get All Loyalty Points
**GET** `/api/admin/loyalty?page=1&limit=50&tier=gold&minPoints=1000`

### Adjust User Loyalty Points
**PATCH** `/api/admin/loyalty/:userId`
```json
{
  "points": 500,
  "reason": "Bonus for referral"
}
```
Positive points = add, negative = deduct

---

## ⭐ Review Management

### Get All Reviews
**GET** `/api/admin/reviews?page=1&limit=50&approved=false&rating=5`

### Moderate Review
**PATCH** `/api/admin/reviews/:id`
```json
{
  "isApproved": true
}
```

---

## 📋 Content Management

### Get All Banners (Admin)
**GET** `/api/admin/content/banners`

### Get All Featured Products (Admin)
**GET** `/api/admin/content/featured?section=featured`

### Reorder Banners
**PATCH** `/api/admin/content/banners/reorder`
```json
{
  "bannerOrders": [
    { "bannerId": "id1", "order": 1 },
    { "bannerId": "id2", "order": 2 }
  ]
}
```

### Reorder Featured Products
**PATCH** `/api/admin/content/featured/reorder`
```json
{
  "featuredOrders": [
    { "featuredId": "id1", "order": 1 },
    { "featuredId": "id2", "order": 2 }
  ]
}
```

---

## ⚙️ System Settings

### Get All Settings
**GET** `/api/admin/settings?category=general`

Returns settings grouped by category.

### Update Setting
**PUT** `/api/admin/settings/:key`
```json
{
  "value": "setting_value",
  "description": "Setting description",
  "isPublic": false
}
```

**Common Settings Keys:**
- `site.name` - Site name
- `site.description` - Site description
- `site.logo` - Logo URL
- `site.maintenance` - Maintenance mode (boolean)
- `email.enabled` - Email service enabled
- `loyalty.points_per_dollar` - Points per dollar spent
- `loyalty.points_expiry_days` - Points expiry in days
- `features.reviews_enabled` - Enable/disable reviews
- `features.wishlist_enabled` - Enable/disable wishlist
- `features.loyalty_enabled` - Enable/disable loyalty program

---

## 📊 Analytics & Reports

### Get Wishlists (Admin)
**GET** `/api/admin/wishlists?page=1&limit=50`

### Get Recently Viewed (Admin)
**GET** `/api/admin/recently-viewed?page=1&limit=50`

---

## 📝 Audit Logs

### Get Audit Logs
**GET** `/api/audit-logs?page=1&limit=50&user=userId&action=create&resource=product&startDate=2026-01-01&endDate=2026-01-31`

### Get Audit Log by ID
**GET** `/api/audit-logs/:id`

---

## 🔐 Session Management

### Get User Sessions
**GET** `/api/auth/sessions` (for current user)

### Revoke Session
**DELETE** `/api/auth/sessions/:sessionId`

### Revoke All Other Sessions
**DELETE** `/api/auth/sessions`

---

## Complete Admin Control Summary

### Products
- ✅ Create, update, delete products
- ✅ Bulk operations (update, delete)
- ✅ Toggle featured status
- ✅ Manage tags
- ✅ Advanced filtering and search
- ✅ Product statistics
- ✅ Flash sale management
- ✅ Stock management

### Users
- ✅ View all users with details
- ✅ Update user information
- ✅ Change user roles
- ✅ Delete users
- ✅ Bulk user operations
- ✅ View user loyalty points
- ✅ View user orders count

### Orders
- ✅ View all orders
- ✅ Update order status with custom messages
- ✅ Set estimated delivery dates
- ✅ Order statistics and analytics
- ✅ Filter by status and payment status

### Payments
- ✅ View all payments
- ✅ Confirm/reject payments
- ✅ Filter by status

### Categories
- ✅ Full CRUD operations
- ✅ Category statistics
- ✅ Bulk category operations

### Promo Codes
- ✅ Full CRUD operations
- ✅ Promo code statistics
- ✅ Usage tracking

### Reviews
- ✅ View all reviews
- ✅ Moderate reviews (approve/reject)
- ✅ Filter by rating and approval status

### Content
- ✅ Banner management (CRUD)
- ✅ Featured products management
- ✅ Reorder banners and featured products

### Flash Sales
- ✅ Create flash sales
- ✅ End flash sales
- ✅ View active flash sales

### Price Alerts
- ✅ View all price alerts
- ✅ Manual price drop check

### Loyalty Points
- ✅ View all users' loyalty points
- ✅ Adjust points manually
- ✅ Filter by tier and points

### Settings
- ✅ Get all settings
- ✅ Update any setting
- ✅ Categorized settings

### Analytics
- ✅ Dashboard statistics
- ✅ Sales analytics
- ✅ Product performance
- ✅ User growth
- ✅ Category performance

### Audit Logs
- ✅ View all admin actions
- ✅ Filter by user, action, resource, date

### Wishlists & Recently Viewed
- ✅ View all user wishlists
- ✅ View all recently viewed products

---

## Notes

- All admin endpoints require authentication (`Authorization: Bearer <token>`)
- All admin endpoints require admin role
- All state-changing operations (POST, PUT, PATCH, DELETE) are logged in audit logs
- Bulk operations support updating multiple items at once
- All endpoints support pagination where applicable
- All endpoints include proper validation and error handling
