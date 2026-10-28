const router = require('express').Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { User, Movie, Booking } = require('../models');
const { sendTicketEmail } = require('../utils/ticketMailer');

router.use(auth);

// Demo payment + booking confirmation
router.post('/', async (req, res) => {
  let movieId, showtimeId, seats;

  try {
    ({ movieId, showtimeId, seats } = req.body);

    if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
      return res.status(400).json({ message: 'Select 1 to 8 seats' });
    }

    if (
      seats.some(s => typeof s !== 'string' || !s.trim()) ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({ message: 'Invalid or duplicate seats' });
    }

    const movie = await Movie.findById(movieId);
    const show = movie && movie.showtimes.id(showtimeId);

    if (!show) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ message: 'Please log in again' });
    }

    // DEMO ONLY: this simulates a successful payment.
    // No real payment provider or money is involved.
    const total = seats.length * show.price;

    // Atomically reserve seats only if none are already booked.
    const result = await Movie.updateOne(
      {
        _id: movieId,
        showtimes: {
          $elemMatch: {
            _id: showtimeId,
            bookedSeats: { $nin: seats }
          }
        }
      },
      {
        $push: {
          'showtimes.$.bookedSeats': { $each: seats }
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(409).json({
        message: 'Some seats were just taken. Pick different seats.'
      });
    }

    let booking;

    try {
      booking = await Booking.create({
        user: req.userId,
        movie: movieId,
        showtimeId,
        seats,
        total,
        paymentStatus: 'fake_success',
        bookingRef: `IM-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
      });
    } catch (err) {
      // Roll back the seat reservation if saving the booking fails.
      await Movie.updateOne(
        { _id: movieId },
        {
          $pullAll: {
            'showtimes.$[s].bookedSeats': seats
          }
        },
        { arrayFilters: [{ 's._id': showtimeId }] }
      );

      throw err;
    }

    // Email failure must not turn an already confirmed booking into
    // an apparent payment failure.
    let emailSent = false;

    try {
      await sendTicketEmail({
        email: user.email,
        name: user.name,
        booking,
        movie,
        show
      });

      emailSent = true;
    } catch (emailError) {
      console.error('Ticket email could not be sent:', emailError.message);
    }

    return res.status(201).json({
      ...booking.toObject(),
      emailSent,
      message: emailSent
        ? 'Demo payment successful. Ticket sent by email.'
        : 'Booking confirmed, but the ticket email could not be sent.'
    });
  } catch (err) {
    console.error('Booking error:', err.message);
    return res.status(500).json({ message: 'Could not complete the booking' });
  }
});

// Existing booking history
router.get('/mine', async (req, res) => {
  try {
    const list = await Booking.find({ user: req.userId })
      .populate('movie', 'title poster showtimes')
      .sort('-createdAt');

    res.json(list.filter(b => b.movie).map(b => {
      const o = b.toObject();
      const s = b.movie.showtimes.id(b.showtimeId);

      o.show = s && { time: s.time, screen: s.screen };
      o.movie = { title: b.movie.title, poster: b.movie.poster };

      return o;
    }));
  } catch (err) {
    res.status(500).json({ message: 'Could not load bookings' });
  }
});

// Existing cancellation
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Movie.updateOne(
      { _id: booking.movie },
      {
        $pullAll: {
          'showtimes.$[s].bookedSeats': booking.seats
        }
      },
      { arrayFilters: [{ 's._id': booking.showtimeId }] }
    );

    await booking.deleteOne();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not cancel booking' });
  }
});

module.exports = router;