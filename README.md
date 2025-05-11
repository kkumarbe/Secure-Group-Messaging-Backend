# Secure Group Messaging Backend

This project is a secure backend for a group messaging application built using Node.js, Express, MongoDB, and JWT authentication. It supports group creation, member approval, secure AES-128 message encryption, and Swagger API documentation.

## 🚀 Features

- User registration and login with JWT
- Private and public group creation
- Join request approval by group owners
- AES-128 encryption for message security
- Swagger documentation for all APIs

## 🛠️ Technologies Used

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework
- **MongoDB** (via Mongoose) – NoSQL database
- **JWT** – Authentication tokens
- **Crypto** – AES-128 encryption
- **Swagger** – API documentation

---
## ⚙️ Getting Started

## Prerequisites

- Node.js >= 14.x
- MongoDB running locally or on the cloud
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/kkumarbe/Secure-Group-Messaging-Backend.git
cd Secure-Group-Messaging-Backend
```

2. Install dependencies:

```bash
npm install
npm install express mongoose dotenv jsonwebtoken bcryptjs
```
| Library       | Purpose                          |
|---------------|----------------------------------|
| express       | Web framework                    |
| mongoose      | MongoDB object modeling          |
| dotenv        | Environment config loader        |
| jsonwebtoken  | Token-based authentication       |
| bcryptjs      | Password hashing and validation  |

```bash
npm install swagger-jsdoc swagger-ui-express
```
Library	Purpose
swagger-jsdoc	Generate Swagger docs from JSDoc comments
swagger-ui-express	Serve Swagger UI via Express

3. Create a `.env` file in the root directory and add the following:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/secure-chat
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_16_char_hex_key  # Must be 16 bytes (128 bits), hex-encoded
ENCRYPTION_IV=your_16_char_hex_iv   # Must be 16 bytes (128 bits), hex-encoded
```

4. Start the server:

```bash
npm start
```

## API Documentation

Swagger is available at:
```
http://localhost:3000/api-docs
```

## Folder Structure

```
├── src
│   ├── controllers/       # Business logic for auth, groups, messages
│   ├── middleware         # Auth middleware and error handling
│   ├── models             # Mongoose schemas
│   ├── routes             # Route definitions (index.js combines all)
│   └── utils
├── .env                  # Environment variable
├── package.json
├── README.md           # Project documentstion and execution step
├── server.js           # Main app initialization
  

```

Example Endpoints
POST /api/auth/register – Register a new user

POST /api/auth/login – Login and receive JWT

POST /api/groups – Create a group

POST /api/groups/:groupId/join – Request to join group

POST /api/groups/:groupId/approve?userId=... – Approve user

POST /api/groups/:groupId/messages – Send message


## Important Notes

- Ensure `AES_KEY` and `AES_IV` in `.env` are valid hex strings of proper length.
- Routes are mounted under `/api`, e.g., `/api/auth/login`, `/api/groups/:id/messages`.
- Make sure MongoDB is running on your local machine or change the MONGO_URI accordingly.
- AES encryption/decryption must match the key/IV format.
- JWT tokens are short-lived; refresh logic can be added.


## License

NA
