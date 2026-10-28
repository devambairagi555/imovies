# 🎬 IMovies — Online Movie Ticket Booking

IMovies is a full-stack movie ticket booking web application where users can explore movies, create accounts, log in, and book movie tickets through a simple web interface.

**Live Website:** https://imovies-frontend-x4xg.onrender.com

**Backend API:** https://imovies-api-d5ta.onrender.com

## ✨ Features

- 🎥 Browse movies and view movie details.
- 👤 User registration and login.
- 🔐 Token-based authentication using JWT.
- 🎟️ Movie ticket booking.
- 💺 Showtimes and seat inventory management.
- 🗄️ MongoDB database integration.
- 📧 Email confirmation support, when configured.
- 📱 Responsive frontend for different screen sizes.
- ☁️ Deployment using Render.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS

### Backend
- Node.js
- Express.js
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Nodemailer (for email functionality, when configured)

### Deployment
- Render — frontend and backend hosting
- MongoDB Atlas — cloud database

## 📁 Project Structure

```text
imovies/
├── client/
│   ├── src/
│   │   ├── api.js
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A MongoDB database, such as [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone the repository

```bash
git clone https://github.com/devambairagi555/imovies.git
cd imovies
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Add any other environment variables required by your existing backend, such as email configuration.

**Security:** Never commit your `.env` file, database credentials, JWT secrets, or email app passwords to GitHub.

### 4. Start the backend

```bash
npm start
```

The backend should run on:

`http://localhost:5000`

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Configure the frontend

Create a `.env` file inside `client`:

```env
VITE_API_URL=http://localhost:5000
```

The frontend API helper uses this variable to connect to the backend.

### 7. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## ⚙️ Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for signing JWTs |
| `VITE_API_URL` | Backend API base URL |
| Email variables | Used if email notifications are configured |

The `VITE_API_URL` variable is public in the built frontend. Never put passwords, database credentials, or private API secrets in variables beginning with `VITE_`.

## 🌐 Deployment

### Backend deployment

Deploy the `server` directory as a Render Web Service. Configure the required backend environment variables in Render.

### Frontend deployment

Deploy the `client` directory as a Render Static Site.

Set the frontend environment variable:

```env
VITE_API_URL=https://imovies-api-d5ta.onrender.com
```

Redeploy the frontend after changing build-time environment variables.

## 🔌 API Routes

The following routes are registered in the backend:

| Route | Purpose |
|---|---|
| `/health` | Backend health check |
| `/api/auth` | Authentication endpoints |
| `/api/movies` | Movie endpoints |
| `/api/bookings` | Booking endpoints |

Specific endpoints and HTTP methods depend on the route implementations.

## 🔒 Security Notes

- Keep `.env` files out of version control.
- Use strong, private JWT secrets.
- Store email app passwords only in backend environment variables.
- Validate user input on the server.
- Protect booking operations with appropriate authentication and authorization.
- Never expose private database credentials in frontend code.

## 🚧 Future Improvements

- Movie search and genre filters.
- Improved movie loading performance.
- Movie detail pages and showtime selection.
- Booking history and ticket management.
- Email ticket delivery.
- Enhanced mobile user experience.
- Payment gateway integration.

## 👨‍💻 Author

**IMovies Project**

GitHub: https://github.com/devambairagi555/imovies

## 📄 License

No license has been specified yet. Add a license file if you intend to permit others to reuse or distribute the project.
