const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

async function sendTicketEmail({ email, name, booking, movie, show }) {
  const seats = booking.seats.map(escapeHtml).join(', ');
  const title = escapeHtml(movie.title);
  const screen = escapeHtml(show.screen || 'To be announced');
  const bookingRef = escapeHtml(booking.bookingRef);
  const showTime = show.time
    ? new Date(show.time).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      })
    : 'To be announced';

  const html = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="padding:24px 10px;background:#f3f4f6;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#171717;color:#fff;padding:24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;">IMovies</h1>
            <p style="margin:8px 0 0;color:#e5e7eb;">Your movie ticket</p>
          </td></tr>
          <tr><td style="padding:24px;">
            <h2 style="margin-top:0;">Booking confirmed!</h2>
            <p>Hello ${escapeHtml(name)}, your IMovies booking is confirmed.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="10"
              style="border-collapse:collapse;background:#fafafa;">
              <tr><td><strong>Movie</strong></td><td>${title}</td></tr>
              <tr><td><strong>Date & time</strong></td><td>${escapeHtml(showTime)}</td></tr>
              <tr><td><strong>Screen</strong></td><td>${screen}</td></tr>
              <tr><td><strong>Seats</strong></td><td>${seats}</td></tr>
              <tr><td><strong>Total</strong></td><td>₹${Number(booking.total).toFixed(2)}</td></tr>
              <tr><td><strong>Booking ID</strong></td><td>${bookingRef}</td></tr>
              <tr><td><strong>Payment</strong></td><td>Demo payment successful</td></tr>
            </table>
            <p style="font-size:13px;line-height:1.5;color:#52525b;">
              This ticket was created by the IMovies demo app. No real payment was processed.
              Please keep your booking ID for reference.
            </p>
          </td></tr>
          <tr><td style="background:#f9fafb;padding:16px;text-align:center;color:#71717a;font-size:12px;">
            Automated email from IMovies
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  return transporter.sendMail({
    from: `"IMovies" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your IMovies ticket - ${booking.bookingRef}`,
    text:
      `Hello ${name}, your IMovies demo booking is confirmed.\n` +
      `Movie: ${movie.title}\nShowtime: ${showTime}\nScreen: ${show.screen || 'To be announced'}\n` +
      `Seats: ${booking.seats.join(', ')}\nTotal: ₹${Number(booking.total).toFixed(2)}\n` +
      `Booking ID: ${booking.bookingRef}\nThis is a demo payment; no real money was charged.`,
    html
  });
}

module.exports = { sendTicketEmail };