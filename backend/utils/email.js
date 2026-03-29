const nodemailer = require('nodemailer');

// Load environment variables (server.js usually does this, but keeping it here for safety in standalone scripts)
require('dotenv').config();

// Debug logs (requested)
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS LOADED:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection (requested)
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

const FROM = process.env.SMTP_FROM || process.env.EMAIL_USER || 'noreply@schedulr.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function isConfigured() {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function platformName(p) {
  return ({ google_meet: 'Google Meet', zoom: 'Zoom', teams: 'Microsoft Teams', custom: 'Custom Link' })[p] || 'Meeting';
}

function buildMeetingDetails(booking) {
  let details = `
    <p><strong>Event:</strong> ${booking.event_name || 'Meeting'}</p>
    <p><strong>Date:</strong> ${formatDate(booking.start_time)}</p>
    <p><strong>Time:</strong> ${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}</p>
  `;

  if (booking.meeting_mode === 'online' && booking.meeting_link) {
    details += `
      <p><strong>Platform:</strong> ${platformName(booking.platform)}</p>
      <p><strong>Meeting Link:</strong> <a href="${booking.meeting_link}">${booking.meeting_link}</a></p>
    `;
  } else if (booking.meeting_mode === 'offline' && booking.location) {
    details += `<p><strong>Location:</strong> ${booking.location}</p>`;
  }

  return details;
}

async function sendBookingConfirmation(booking) {
  console.log(`[Email] SEND_CONFIRM invoked. User: ${process.env.EMAIL_USER}, PassLoaded: ${!!process.env.EMAIL_PASS}`);
  console.log(`[Email] Recipient: ${booking?.email}, BookingID: ${booking?.id}`);

  if (!isConfigured()) {
    console.warn('[Email] SMTP check failed (isConfigured=false). EMAIL_USER or EMAIL_PASS missing from process.env?');
    // return; // Don't return, let it try anyway to see the error
  }

  if (!booking || !booking.email) {
    console.error('[Email] Aborting: No recipient email provided.');
    return;
  }

  const rescheduleUrl = `${APP_URL}/book/${booking.slug}?reschedule_token=${booking.reschedule_token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Schedulr" <${FROM}>`,
      to: booking.email,
      subject: `Meeting Confirmed: ${booking.event_name || 'Your booking'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Your meeting is confirmed! ✓</h2>
          ${buildMeetingDetails(booking)}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Need to change the time? <a href="${rescheduleUrl}">Reschedule your meeting</a>
          </p>
        </div>
      `,
    });
    console.log(`[Email] Booking confirmation sent to ${booking.email}. Response: ${info.response}`);
  } catch (err) {
    console.error('[Email] Failed to send booking confirmation:', err.message);
  }
}

async function sendRescheduleConfirmation(booking) {
  if (!isConfigured()) {
    console.log('[Email] SMTP not configured — skipping reschedule confirmation email');
    return;
  }

  console.log(`[Email] Attempting to send reschedule confirmation to: ${booking.email}`);
  if (!booking.email) {
    console.error('[Email] Error: booking.email is missing for booking ID:', booking.id);
    return;
  }

  const rescheduleUrl = `${APP_URL}/book/${booking.slug}?reschedule_token=${booking.reschedule_token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Schedulr" <${FROM}>`,
      to: booking.email,
      subject: `Meeting Rescheduled: ${booking.event_name || 'Your booking'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Your meeting has been rescheduled</h2>
          <p style="color: #6b7280;">Here are your updated details:</p>
          ${buildMeetingDetails(booking)}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Need to change again? <a href="${rescheduleUrl}">Reschedule your meeting</a>
          </p>
        </div>
      `,
    });
    console.log(`[Email] Reschedule confirmation sent to ${booking.email}. Response: ${info.response}`);
  } catch (err) {
    console.error('[Email] Failed to send reschedule confirmation:', err.message);
  }
}

async function sendCancellationNotice(booking) {
  if (!isConfigured()) {
    console.log('[Email] SMTP not configured — skipping cancellation email');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Schedulr" <${FROM}>`,
      to: booking.email,
      subject: `Meeting Cancelled: ${booking.event_name || 'Your booking'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Your meeting has been cancelled</h2>
          <p style="color: #6b7280;">The following meeting has been cancelled:</p>
          ${buildMeetingDetails(booking)}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Want to book again? Visit <a href="${APP_URL}">${APP_URL}</a>
          </p>
        </div>
      `,
    });
    console.log(`[Email] Cancellation notice sent to ${booking.email}`);
  } catch (err) {
    console.error('[Email] Failed to send cancellation notice:', err.message);
  }
}

async function testEmail() {
  if (!isConfigured()) {
    console.log('[Email] SMTP not configured — skipping test email');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "Email is working",
    });
    console.log("Test email sent successfullly to", process.env.EMAIL_USER);
  } catch (err) {
    console.error("Test email error:", err);
  }
}

module.exports = {
  sendBookingConfirmation,
  sendRescheduleConfirmation,
  sendCancellationNotice,
  testEmail,
};
