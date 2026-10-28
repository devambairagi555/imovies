
const { Schema, model } = require('mongoose');

const User = model('User', new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: undefined },
  resetPasswordExpires: { type: Date, default: undefined }
}));


const Movie = model('Movie', new Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: String,
  genre: String,
  duration: Number,
  description: String,
  poster: String,
  showtimes: [{
    time: Date,
    screen: String,
    price: Number,
    bookedSeats: { type: [String], default: [] }
  }]
}));


const Booking = model('Booking', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  showtimeId: { type: Schema.Types.ObjectId, required: true },
  seats: [{ type: String }],
  total: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['fake_success'],
    default: 'fake_success'
  },
  bookingRef: { type: String, unique: true, sparse: true }
}, { timestamps: true }));

module.exports = { User, Movie, Booking };
