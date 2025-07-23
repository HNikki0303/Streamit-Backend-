Perfect. Now that I have your **backend code**, here is a polished and comprehensive `README.md` tailored for your **StreamIt Backend** — a personalized AI-powered MERN video streaming platform.

---

# 📽️ StreamIt Backend

The backend for **StreamIt**, a full-stack MERN video streaming platform that empowers both creators and viewers with a personalized AI assistant based on their channel description. This backend handles user authentication, video uploads, personalized content delivery, and secure data handling — all backed by robust REST APIs.

---

## 🚀 Features

* 🔐 **Authentication & Authorization**

  * JWT-based login & signup
  * Secure password hashing with bcrypt
  * Refresh and access token flow with cookie-based management

* 📤 **Video Upload & Management**

  * Upload large video files and thumbnails using `Multer`
  * Cloud storage integration with **Cloudinary**
  * Paginated video browsing
  * Fetch single video or user-uploaded content
  * Update existing videos (title, description, thumbnail)

* 🎥 **Search & Discovery**

  * Search videos by title with pagination
  * Fetch videos by ID
  * Get paginated video IDs and details by owner

* 🧠 **Personalized AI Assistant**

  * Each user profile includes a `channelDescription` which is used to personalize AI responses

* 👤 **User Profile System**

  * Store full user data including avatar, cover image, watch history, and channel description
  * Profile updates and video management per user

---

## 🛠️ Technologies Used

* **Backend Framework**: Node.js with Express.js
* **Database**: MongoDB (with Mongoose ODM)
* **Authentication**: JWT (Access & Refresh Tokens)
* **Cloud Storage**: Cloudinary
* **File Uploads**: Multer
* **Security**: Bcrypt, HTTP-only cookies
* **Custom Utilities**: `ApiError`, `ApiResponse`, `asyncHandler`

---

## 📁 Project Structure

```
📦 backend
├── controllers/
│   └── video.controller.js
├── middleware/
│   ├── check.middleware.js
│   └── multer.middleware.js
├── model/
│   └── user.model.js
│   └── video.model.js
├── routes/
│   └── video.routes.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── Cloudinary.js
├── config/
│   └── db.js
├── constant.js
└── server.js
```

---

## 🔗 API Endpoints

### 🧾 Auth & User

* `POST /auth/signup` — Create a new user
* `POST /auth/login` — Authenticate user and issue tokens
* `GET /auth/profile` — Get current user profile (JWT-protected)

### 📼 Videos

* `POST /videos/upload` — Upload raw video file
* `POST /videos/publishAVideo` — Upload and publish video with thumbnail (JWT-protected)
* `GET /videos/videoLink/:videoId` — Get video by ID
* `POST /videos/update/:videoId` — Update video details
* `GET /videos/paginated` — Get paginated list of video IDs
* `GET /videos/paginated/user` — Paginated videos for logged-in user
* `GET /videos/searchTitle` — Search videos by title

---

## ⚙️ Environment Variables

Create a `.env` file in your root directory with the following variables:

```env
PORT=8000
MONGO_DB_URL=your_mongodb_url
DATABASE_NAME=streamitDB

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

---

## 🧪 Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Run MongoDB** locally or use Atlas.

3. **Start the server**

```bash
npm run dev
```

---

## 🌐 Connected Frontend

The frontend for StreamIt is built using **React** and communicates with this backend for all video, user, and assistant operations.

> You can find the frontend repo [here](#) *(Add your frontend repo link)*

---

## 👥 Contributing

Feel free to fork the repo, submit issues, or contribute pull requests. This project is open to improvements!

---

## 🧠 Credits

* Built with ❤️ by \[Your Name]
* Cloud services by [Cloudinary](https://cloudinary.com/)
* MongoDB hosting by [MongoDB Atlas](https://www.mongodb.com/atlas)

---

Would you like this README exported to a file or further tailored (like including AI assistant implementation detail)?
