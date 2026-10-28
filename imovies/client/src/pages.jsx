import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, fmt } from './api.js';

/* ---------------- Home ---------------- */





export function Movies() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api('/movies')
      .then(setList)
      .catch((e) => setErr(e.message));
  }, []);

  const combinedMovies = (list || []).map((m) => ({
    ...m,
    searchGenre: m.genre || 'Other',
  }));

  const genres = [
    'All',
    ...new Set(
      combinedMovies.flatMap((m) =>
        m.searchGenre
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      )
    ),
  ];

  const shown = combinedMovies.filter((m) => {
    const matchesTitle = (m.title || '')
      .toLowerCase()
      .includes(query.trim().toLowerCase());

    const matchesGenre =
      genre === 'All' ||
      m.searchGenre.split(',').some((g) => g.trim() === genre);

    return matchesTitle && matchesGenre;
  });

  const openMovie = (movie) => {
    navigate('/movie/' + movie._id);
  };

  return (
    <section aria-labelledby="discover">
      <div className="section-head">
        <h2 id="discover">Discover Movies</h2>

        <input
          className="input search"
          type="search"
          placeholder="Search by title"
          aria-label="Search movies by title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chips" role="group" aria-label="Filter by genre">
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            className={'chip' + (g === genre ? ' chip--on' : '')}
            aria-pressed={g === genre}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {err && <p className="alert alert--error">{err}</p>}

      {!list && !err && (
        <p className="muted">Loading movies…</p>
      )}

      {list && shown.length === 0 && (
        <p className="muted">
          No movies match your search. Try another title or genre.
        </p>
      )}

      <div className="grid">
        {shown.map((movie) => (
          <article className="card" key={movie._id}>
            <div className="card__img">
              <img
                src={movie.poster || ''}
                alt={movie.title}
                loading="lazy"
              />
            </div>

            <div className="card__body">
              <h3>{movie.title}</h3>

              <p className="muted">
                {movie.genre || 'Other'}
                {movie.duration ? ` · ${movie.duration} min` : ''}
              </p>

              <button
                type="button"
                className="btn btn--primary"
                onClick={() => openMovie(movie)}
              >
                Book Tickets
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}





/* ---------------- Movie details + seats ---------------- */
const ROWS = 'ABCDE'.split('');
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export function MovieDetail({ user }) 
{

  const { id } = useParams();
  const nav = useNavigate();
  const [movie, setMovie] = useState(null);
  const [sid, setSid] = useState(null);
  const [picked, setPicked] = useState([]);
  const [msg, setMsg] = useState('');
  const [paymentReview, setPaymentReview] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const load = () =>
    api('/movies/' + id)
      .then((m) => { setMovie(m); setSid((s) => s || m.showtimes[0]?._id); })
      .catch((e) => setMsg(e.message));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // live seat availability
    return () => clearInterval(t);
  }, [id]);

  if (!movie) return <p className="muted">{msg || 'Loading…'}</p>;
  const show = movie.showtimes.find((s) => s._id === sid);
  if (!show) return <p className="muted">No showtimes available yet.</p>;
  if (paymentResult) {
  return (
    <div className="empty">
      <h1>Booking confirmed!</h1>
      <p>{paymentResult.message}</p>

      <h2>{movie.title}</h2>

      <p>
        Booking ID: {paymentResult.bookingRef || paymentResult._id}
      </p>

      <p>
        Total paid (demo): ₹{paymentResult.total}
      </p>

      <p className="muted">
        No real payment was processed.
      </p>

      {!paymentResult.emailSent && (
        <p className="alert alert--warn">
          Your booking is confirmed, but the ticket email could not be sent.
          Check your Gmail configuration or server logs.
        </p>
      )}

      <button
        className="btn btn--primary"
        onClick={() => nav('/bookings')}
      >
        View My Bookings
      </button>
    </div>
  );
}

  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const book = () => {
  if (!user) {
    nav('/login');
    return;
  }

  if (!picked.length) {
    setMsg('Please select at least one seat.');
    return;
  }

  setMsg('');
  setPaymentReview(true);
};

const confirmPayment = async () => {
  if (paying || !picked.length) return;

  setPaying(true);
  setMsg('');

  try {
    const result = await api('/bookings', 'POST', {
      movieId: id,
      showtimeId: sid,
      seats: picked
    });

    setPaymentResult(result);
    setPaymentReview(false);
    setPicked([]);
    load();
  } catch (e) {
    setMsg(e.message);
    load();
  } finally {
    setPaying(false);
  }
};

 return (
  <div className="detail">
    <aside>
      <img
        className="detail__poster"
        src={movie.poster}
        alt={movie.title}
      />
    </aside>

    <div>
      <h1>{movie.title}</h1>
      <p className="muted">
        {movie.genre} · {movie.duration} min
      </p>
      <p className="detail__desc">{movie.description}</p>

      <h2 className="h-sm">Choose a showtime</h2>

      <div className="chips">
        {movie.showtimes.map((s) => (
          <button
            key={s._id}
            type="button"
            className={'chip' + (s._id === sid ? ' chip--on' : '')}
            aria-pressed={s._id === sid}
            onClick={() => {
              setSid(s._id);
              setPicked([]);
              setMsg('');
              setPaymentReview(false);
            }}
          >
            {fmt(s.time)}
          </button>
        ))}
      </div>

      <div className="theatre">
        <div className="screen" aria-hidden="true">
          <span>Screen</span>
        </div>

        <div className="seats" role="group" aria-label="Seat selection">
          {ROWS.map((r) => (
            <div className="seat-row" key={r}>
              <span className="seat-label" aria-hidden="true">
                {r}
              </span>

              {COLS.map((c) => {
                const s = r + c;
                const taken = show.bookedSeats.includes(s);
                const on = picked.includes(s);

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={taken || paying || paymentReview}
                    aria-pressed={on}
                    aria-label={`Seat ${s}${taken ? ', booked' : ''}`}
                    className={
                      'seat' +
                      (taken
                        ? ' seat--taken'
                        : on
                        ? ' seat--on'
                        : '') +
                      (c === 4 ? ' seat--aisle' : '')
                    }
                    onClick={() => toggle(s)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <ul className="legend">
          <li>
            <i className="seat seat--legend" /> Available
          </li>
          <li>
            <i className="seat seat--legend seat--on" /> Selected
          </li>
          <li>
            <i className="seat seat--legend seat--taken" /> Booked
          </li>
        </ul>
      </div>

      {msg && <p className="alert alert--warn">{msg}</p>}

      {paymentReview ? (
        <div className="summary">
          <div>
            <h3>Review your payment</h3>
            <p>{movie.title}</p>
            <p className="muted">
              {fmt(show.time)} · {show.screen}
            </p>
            <p>Seats: {picked.join(', ')}</p>
            <p className="muted">
              Demo payment only. No real money will be charged.
            </p>
          </div>

          <div className="summary__right">
            <strong className="price">
              ₹{picked.length * show.price}
            </strong>

            <button
              type="button"
              className="btn btn--primary"
              disabled={paying || !picked.length}
              onClick={confirmPayment}
            >
              {paying ? 'Processing...' : 'Pay Now (Demo)'}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              disabled={paying}
              onClick={() => setPaymentReview(false)}
            >
              Back to Seats
            </button>
          </div>
        </div>
      ) : (
        <div className="summary">
          <div>
            <h3>Booking summary</h3>
            <p className="muted">
              {fmt(show.time)} · {show.screen}
            </p>
            <p>
              {picked.length
                ? `Seats ${picked.join(', ')}`
                : 'No seats selected'}
            </p>
          </div>

          <div className="summary__right">
            <strong className="price">
              ₹{picked.length * show.price}
            </strong>

            <button
              type="button"
              className="btn btn--primary"
              disabled={!picked.length || paying}
              onClick={book}
            >
              {user ? 'Book Seats' : 'Login to Book'}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

/* ---------------- Login / Register ---------------- */
export function Auth({ onAuth }) {
  const [reg, setReg] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [f, setF] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    setServerErr('');
    setResetMessage('');

    if (forgot) {
      if (!/^\S+@\S+\.\S+$/.test(f.email)) {
        setServerErr('Enter a valid email address.');
        return;
      }

      try {
        setLoading(true);
        await api('/auth/forgot-password', 'POST', {
          email: f.email
        });
        setResetMessage(
          'If an account exists for this email, reset instructions will be sent.'
        );
      } catch (x) {
        setServerErr(x.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const e = {};
    if (reg && !f.name.trim()) {
      e.name = 'Enter your name.';
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (f.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }

    setErrs(e);
    if (Object.keys(e).length) return;

    try {
      setLoading(true);
      onAuth(
        await api(reg ? '/auth/register' : '/auth/login', 'POST', f)
      );
    } catch (x) {
      setServerErr(x.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <h1>
        {forgot
          ? 'Forgot your password?'
          : reg
          ? 'Create your account'
          : 'Welcome back'}
      </h1>

      <p className="muted">
        {forgot
          ? 'Enter your registered email to request a password reset.'
          : reg
          ? 'Sign up to book seats in seconds.'
          : 'Log in to book and manage your tickets.'}
      </p>

      <form onSubmit={submit} noValidate className="form">
        {reg && !forgot && (
          <label>
            Name
            <input
              className="input"
              value={f.name}
              onChange={set('name')}
              autoComplete="name"
            />
            {errs.name && (
              <span className="field-error">{errs.name}</span>
            )}
          </label>
        )}

        <label>
          Email
          <input
            className="input"
            type="email"
            value={f.email}
            onChange={set('email')}
            autoComplete="email"
            required
          />
          {errs.email && (
            <span className="field-error">{errs.email}</span>
          )}
        </label>

        {!forgot && (
          <label>
            Password
            <input
              className="input"
              type="password"
              value={f.password}
              onChange={set('password')}
              autoComplete={reg ? 'new-password' : 'current-password'}
            />
            {errs.password && (
              <span className="field-error">{errs.password}</span>
            )}
          </label>
        )}

        {!reg && !forgot && (
          <div className="forgot-row">
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setForgot(true);
                setServerErr('');
                setResetMessage('');
                setErrs({});
              }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {serverErr && (
          <p className="alert alert--error">{serverErr}</p>
        )}

        {resetMessage && (
          <p className="reset-message">{resetMessage}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : forgot
            ? 'Send Reset Instructions'
            : reg
            ? 'Sign Up'
            : 'Login'}
        </button>
      </form>

      <button
        type="button"
        className="link-btn"
        onClick={() => {
          setForgot(false);
          setReg(false);
          setServerErr('');
          setResetMessage('');
          setErrs({});
        }}
      >
        {forgot ? 'Back to Login' : null}
      </button>

      {!forgot && (
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setReg(!reg);
            setErrs({});
            setServerErr('');
          }}
        >
          {reg
            ? 'Already registered? Login'
            : 'New here? Create an account'}
        </button>
      )}
    </div>
  );
}

/* ---------------- My Bookings ---------------- */
export function Bookings() {
  const [list, setList] = useState(null);
  const nav = useNavigate();
  const load = () => api('/bookings/mine').then(setList).catch(() => nav('/login'));
  useEffect(() => { load(); }, []);
  const cancel = async (id) => { await api('/bookings/' + id, 'DELETE'); load(); };

  if (!list) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1>My Bookings</h1>
      {!list.length && (
        <div className="empty">
          <h2>No bookings yet</h2>
          <p className="muted">Your tickets will show up here once you book a seat.</p>
          <Link className="btn btn--primary" to="/">Browse Movies</Link>
        </div>
      )}
      <div className="bookings">
        {list.map((b) => (
          <article className="ticket" key={b._id}>
            <img src={b.movie.poster} alt="" />
            <div className="ticket__info">
              <h3>{b.movie.title}</h3>
              <p className="muted">{b.show && fmt(b.show.time)} · {b.show?.screen}</p>
              <p className="ticket__seats">{b.seats.map((s) => <span className="badge" key={s}>{s}</span>)}</p>
            </div>
            <div className="ticket__side">
              <strong className="price">₹{b.total}</strong>
              <button className="btn btn--danger btn--sm" onClick={() => cancel(b._id)}>Cancel Booking</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
