# API Reference Guide - Self-Order System

Panduan untuk mengintegrasikan backend API dengan Self-Order System.

## 📌 Base URL
```
http://api.example.com/api/v1
```

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "kasir",
  "password": "pass123",
  "role": "kasir"  // atau "owner"
}

Response 200:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "kasir",
    "role": "kasir"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 📦 Menu Management

### Get All Menus
```http
GET /menus?category=Makanan&search=goreng

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng Spesial",
      "category": "Makanan",
      "price": 32000,
      "stock": 10,
      "description": "Nasi goreng dengan telur...",
      "image": "url"
    }
  ]
}
```

### Create Menu
```http
POST /menus
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Menu Baru",
  "category": "Makanan",
  "price": 35000,
  "stock": 15,
  "description": "Deskripsi produk",
  "image": "url_image"
}

Response 201:
{
  "success": true,
  "data": { menu object }
}
```

### Update Menu
```http
PUT /menus/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Menu Updated",
  "price": 36000,
  "stock": 20
}

Response 200:
{
  "success": true,
  "data": { updated menu object }
}
```

### Delete Menu
```http
DELETE /menus/:id
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Menu deleted"
}
```

### Update Stock
```http
PATCH /menus/:id/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock": 25
}

Response 200:
{
  "success": true,
  "data": { menu object }
}
```

## 🛒 Orders

### Create Order
```http
POST /orders
Content-Type: application/json

{
  "customerName": "Budi",
  "phone": "08123456789",
  "tableNumber": "A1",
  "paymentMethod": "cash",
  "notes": "Tanpa sambal",
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "price": 32000
    }
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "orderId": "ORD-1234567890",
    "customerId": null,
    "totalPrice": 64000,
    "status": "pending",
    "createdAt": "2024-05-29T10:00:00Z"
  }
}
```

### Get Orders
```http
GET /orders?status=pending&limit=10&page=1

Response 200:
{
  "success": true,
  "data": [
    {
      "orderId": "ORD-123",
      "customerName": "Budi",
      "tableNumber": "A1",
      "totalPrice": 64000,
      "status": "pending",
      "items": [...]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### Update Order Status
```http
PATCH /orders/:orderId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"  // pending, in_progress, completed, cancelled
}

Response 200:
{
  "success": true,
  "data": { order object }
}
```

### Get Order Details
```http
GET /orders/:orderId

Response 200:
{
  "success": true,
  "data": {
    "orderId": "ORD-123",
    "customerName": "Budi",
    "phone": "08123456789",
    "tableNumber": "A1",
    "items": [
      {
        "menuId": 1,
        "menuName": "Nasi Goreng",
        "quantity": 2,
        "price": 32000
      }
    ],
    "subtotal": 64000,
    "tax": 6400,
    "totalPrice": 70400,
    "paymentMethod": "cash",
    "status": "completed",
    "createdAt": "2024-05-29T10:00:00Z"
  }
}
```

## 📊 Analytics (Owner Only)

### Get Dashboard Stats
```http
GET /analytics/dashboard
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 4500000,
    "averageOrderValue": 30000,
    "todayOrders": 12,
    "todayRevenue": 360000
  }
}
```

### Get Revenue by Date
```http
GET /analytics/revenue?startDate=2024-05-01&endDate=2024-05-31

Response 200:
{
  "success": true,
  "data": [
    {
      "date": "2024-05-01",
      "revenue": 450000,
      "orderCount": 15
    },
    {
      "date": "2024-05-02",
      "revenue": 520000,
      "orderCount": 18
    }
  ]
}
```

### Get Popular Items
```http
GET /analytics/popular-items?limit=10

Response 200:
{
  "success": true,
  "data": [
    {
      "menuId": 1,
      "menuName": "Nasi Goreng Spesial",
      "totalSold": 45,
      "revenue": 1440000
    },
    {
      "menuId": 2,
      "menuName": "Ayam Bakar Madu",
      "totalSold": 38,
      "revenue": 1444000
    }
  ]
}
```

## 🔄 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Field 'customerName' is required",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_REQUEST` (400): Input validation failed
- `UNAUTHORIZED` (401): Missing or invalid token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error

## 🔑 Required Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

## 📝 Implementation Checklist

- [ ] Setup Express/Node.js backend
- [ ] Create PostgreSQL/MySQL database
- [ ] Implement JWT authentication
- [ ] Create menu management endpoints
- [ ] Create order management endpoints
- [ ] Create analytics endpoints
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add logging
- [ ] Add unit tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Deploy to production

## 🔄 Frontend Integration Steps

1. **Update API URLs** in services
2. **Replace localStorage** with API calls
3. **Add error handling** with try-catch
4. **Add loading states** during API calls
5. **Add token handling** in request interceptors
6. **Add refresh token** logic
7. **Handle 401 unauthorized** to redirect to login
8. **Add request timeout** handling

### Example Service (Axios)

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📋 Database Schema (Reference)

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('kasir', 'owner'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Menus Table
```sql
CREATE TABLE menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  category VARCHAR(100),
  price INT,
  stock INT,
  description TEXT,
  image VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId VARCHAR(50) UNIQUE,
  customerName VARCHAR(255),
  phone VARCHAR(20),
  tableNumber VARCHAR(50),
  paymentMethod VARCHAR(50),
  notes TEXT,
  totalPrice INT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT,
  menuId INT,
  quantity INT,
  price INT,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (menuId) REFERENCES menus(id)
);
```

---

**Version**: 1.0.0  
**Last Updated**: May 2026
