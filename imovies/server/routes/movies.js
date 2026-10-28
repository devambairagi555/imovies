const router = require('express').Router();
const { Movie } = require('../models');
router.get('/', async (req, res) => res.json(await Movie.find().select('-showtimes.bookedSeats')));
router.get('/:id', async (req, res) => {
  const m = await Movie.findById(req.params.id);
  m ? res.json(m) : res.status(404).json({ message: 'Movie not found' });
});
module.exports = router;
