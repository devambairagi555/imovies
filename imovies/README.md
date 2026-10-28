# IMovies – MERN movie ticket booking
## Run
1. Start MongoDB locally (or use Atlas).
2. Server: `cd server && cp .env.example .env && npm i && npm run seed && npm start`  (http://localhost:5000)
3. Client: `cd client && npm i && npm run dev`  (http://localhost:5173, proxies /api to :5000)

## API
POST /api/auth/register | /api/auth/login
GET  /api/movies, /api/movies/:id            (seat availability, client polls every 5s)
POST /api/bookings {movieId, showtimeId, seats[]}   (JWT)  – atomic, rejects already-taken seats
GET  /api/bookings/mine (JWT) · DELETE /api/bookings/:id (JWT, frees seats)
