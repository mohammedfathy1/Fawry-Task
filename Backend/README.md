# 🛒 Fawry Task

A Spring Boot REST API that lets admins import meals from **TheMealDB**, manage a grocery product catalog, and allows users to build and manage their personal shopping lists.

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Spring Boot project running on `http://localhost:8080`




---

## 🔐 Authentication

All endpoints (except registration and login) require a **Bearer JWT token**.

The token is automatically stored in the `authToken` environment variable after login.

| Variable        | Description                        |
|-----------------|------------------------------------|
| `authToken`     | Active token (admin or user)       |
| `adminToken`    | Token saved after admin login      |
| `userToken`     | Token saved after user login       |
| `baseUrl`       | Default: `http://localhost:8080`   |

---

## 📋 API Reference

### 1. Auth — `/api/v1/auth`

| Method | Endpoint                  | Role   | Description                               | Status |
|--------|---------------------------|--------|-------------------------------------------|--------|
| POST   | `/register`               | Public | Register a new user with `ROLE_USER`      | 201    |
| POST   | `/register/admin`         | Public | Register a new admin with `ROLE_ADMIN`    | 201    |
| POST   | `/login`                  | Public | Login and receive a JWT token             | 200    |

#### Register User — Request Body
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123"
}
```

#### Login — Request Body
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Login — Response
```json
{
  "token": "eyJhbGci...",
  "username": "admin",
  "role": "ROLE_ADMIN"
}
```

---

### 2. Admin — Browse TheMealDB — `/api/v1/admin/meals`

> 🔒 Requires `ROLE_ADMIN`

Used to browse TheMealDB before deciding which meals to import into the grocery catalog.

| Method | Endpoint                          | Description                                  | Status |
|--------|-----------------------------------|----------------------------------------------|--------|
| GET    | `/search?query=chicken`           | Search meals by name                         | 200    |
| GET    | `/categories`                     | List all meal categories (Chicken, Seafood…) | 200    |
| GET    | `/by-category?category=Seafood`   | Get all meals in a specific category         | 200    |
| GET    | `/{mealId}`                       | Get full details of a meal by its ID         | 200    |

> **Tip:** After `Search Meals by Name`, the first result's `idMeal` is automatically saved to the `mealId` environment variable.

---

### 3. Admin — Product Management — `/api/v1/admin/products`

> 🔒 Requires `ROLE_ADMIN`

| Method | Endpoint                              | Description                                          | Status |
|--------|---------------------------------------|------------------------------------------------------|--------|
| POST   | `/import/{mealId}`                    | Import a single meal from TheMealDB                  | 201    |
| POST   | `/bulk-import`                        | Import multiple meals at once                        | 201    |
| POST   | `/`                                   | Create a custom product manually                     | 201    |
| GET    | `/?page=0&size=10&sortBy=createdAt`   | Get all products (including unapproved), paginated   | 200    |
| GET    | `/{productId}`                        | Get full details of any product                      | 200    |
| PUT    | `/{productId}`                        | Update product fields                                | 200    |
| PATCH  | `/{productId}/approve`                | ✅ Approve product — makes it visible to users       | 200    |
| PATCH  | `/{productId}/unapprove`              | ❌ Unapprove product — hides it from users           | 200    |
| DELETE | `/{productId}`                        | Permanently delete a product                         | 204    |

#### Import Meal — Request Body
```json
{
  "estimatedPrice": 12.99,
  "calories": 450.0,
  "brand": "Fawry Grocery",
  "approved": false
}
```

#### Bulk Import — Request Body
```json
{
  "externalIds": ["52772", "52773", "52774", "52775"],
  "defaultPrice": 9.99,
  "defaultCalories": 380.0,
  "autoApprove": false
}
```

#### Bulk Import — Response
```json
{
  "importedCount": 3,
  "skipped": ["52773"],
  "failed": []
}
```

#### Create Custom Product — Request Body
```json
{
  "name": "Organic Brown Rice",
  "category": "Grains",
  "area": "International",
  "brand": "Nature's Best",
  "estimatedPrice": 5.49,
  "calories": 215.0,
  "nutrients": "{\"protein\":\"4g\",\"carbs\":\"45g\",\"fat\":\"1.5g\",\"fiber\":\"2g\"}",
  "ingredients": "[{\"ingredient\":\"Brown Rice\",\"measure\":\"1 cup\"}]",
  "approved": false
}
```

#### Update Product — Request Body (partial)
```json
{
  "estimatedPrice": 15.99,
  "calories": 520.0,
  "brand": "Fawry Premium",
  "nutrients": "{\"protein\":\"35g\",\"carbs\":\"20g\",\"fat\":\"12g\"}"
}
```

---

### 4. User — Browse Grocery Items — `/api/v1/products`

> 🔒 Requires `ROLE_USER` — switch to user token via **Login User**

Only **approved** products are visible here.

| Method | Endpoint                              | Description                                      | Status |
|--------|---------------------------------------|--------------------------------------------------|--------|
| GET    | `/?page=0&size=10&sortBy=name`        | Get all approved products, paginated             | 200    |
| GET    | `/?name=chicken&page=0&size=10`       | Search by name (case-insensitive, partial match) | 200    |
| GET    | `/?category=Seafood&page=0&size=10`   | Filter by category                               | 200    |
| GET    | `/{productId}`                        | Get full product details                         | 200    |

#### Product Detail Fields
| Field            | Type    | Description                        |
|------------------|---------|------------------------------------|
| `name`           | String  | Product name                       |
| `category`       | String  | Meal category (e.g. Seafood)       |
| `area`           | String  | Origin area                        |
| `thumbnail`      | String  | Image URL                          |
| `calories`       | Double  | Calories per serving               |
| `brand`          | String  | Brand name                         |
| `estimatedPrice` | Double  | Price in USD                       |
| `nutrients`      | JSON    | Nutritional breakdown              |
| `ingredients`    | JSON[]  | Ingredients list with measures     |

---

### 5. User — Shopping List — `/api/v1/shopping-list`

> 🔒 Requires `ROLE_USER`

Each user has a personal shopping list. Adding an existing product increments its quantity automatically.

| Method | Endpoint                              | Description                               | Status |
|--------|---------------------------------------|-------------------------------------------|--------|
| GET    | `/`                                   | Get my full shopping list with totals     | 200    |
| POST   | `/`                                   | Add a product to the shopping list        | 201    |
| PUT    | `/{shoppingItemId}?quantity=5`        | Update item quantity (must be ≥ 1)        | 200    |
| DELETE | `/{shoppingItemId}`                   | Remove a specific item                    | 204    |
| DELETE | `/`                                   | Clear the entire shopping list            | 204    |

#### Add to Shopping List — Request Body
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### Shopping List Item — Response
```json
{
  "id": 5,
  "productName": "Chicken Tikka Masala",
  "quantity": 2,
  "unitPrice": 12.99,
  "totalPrice": 25.98
}
```

---

## 🔄 Typical Usage Flow

```
1. Register Admin   →  POST /api/v1/auth/register/admin
2. Login Admin      →  POST /api/v1/auth/login          → token saved
3. Browse Meals     →  GET  /api/v1/admin/meals/search?query=...
4. Import Meal      →  POST /api/v1/admin/products/import/{mealId}
5. Approve Product  →  PATCH /api/v1/admin/products/{productId}/approve

6. Register User    →  POST /api/v1/auth/register
7. Login User       →  POST /api/v1/auth/login          → token saved
8. Browse Products  →  GET  /api/v1/products
9. Add to List      →  POST /api/v1/shopping-list
10. View List       →  GET  /api/v1/shopping-list
```

---

## 🌍 Environment Variables

| Variable          | Default                  | Description                              |
|-------------------|--------------------------|------------------------------------------|
| `baseUrl`         | `http://localhost:8080`  | Base URL of the Spring Boot server       |
| `authToken`       | *(auto-set)*             | Active JWT token                         |
| `adminToken`      | *(auto-set)*             | Admin JWT token                          |
| `userToken`       | *(auto-set)*             | Regular user JWT token                   |
| `mealId`          | `52772`                  | TheMealDB meal ID for import             |
| `productId`       | *(auto-set)*             | ID of the last created/fetched product   |
| `shoppingItemId`  | *(auto-set)*             | ID of the last shopping list item        |

---

## 🛠 Tech Stack

- **Backend:** Java / Spring Boot
- **Security:** Spring Security + JWT
- **External API:** [TheMealDB](https://www.themealdb.com/api.php)
