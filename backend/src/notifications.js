import nodemailer from 'nodemailer';
import Twilio from 'twilio';
import cron from 'node-cron';
import { config } from './config.js';
import { Booking, User } from './models.js';

let transporter = null;
let twilioClient = null;

function initEmail() {
  if (!config.notifications.email.enabled) return;
  transporter = nodemailer.createTransport({
    host: config.notifications.email.host,
    port: config.notifications.email.port,
    secure: !!config.notifications.email.secure,
    auth: config.notifications.email.user ? {
      user: config.notifications.email.user,
      pass: config.notifications.email.pass
    } : undefined
  });
}

function initSms() {
  if (!config.notifications.sms.enabled) return;
  if (config.notifications.sms.provider === 'twilio' && config.notifications.sms.twilioAccountSid && config.notifications.sms.twilioAuthToken) {
    twilioClient = Twilio(config.notifications.sms.twilioAccountSid, config.notifications.sms.twilioAuthToken);
  }
}

async function sendEmail(to, subject, text, html) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: config.notifications.email.from,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.warn('Email send failed:', err.message);
  }
}

async function sendSms(to, body) {
  if (!twilioClient) return;
  try {
    await twilioClient.messages.create({
      to,
      from: config.notifications.sms.twilioFrom,
      body
    });
  } catch (err) {
    console.warn('SMS send failed:', err.message);
  }
}

export async function sendBookingCreated(booking) {
  initEmail(); initSms();
  try {
    const user = await User.findById(booking.userId).lean();
    if (user?.email) {
      const subject = `Booking request received: ${booking.roomId?.name || ''}`;
      const text = `Your booking request for ${booking.roomId?.name || 'a room'} on ${new Date(booking.startTime).toLocaleString()} has been received and is ${booking.status}.`;
      await sendEmail(user.email, subject, text);
    }
    // optionally send SMS if user phone stored (not in current schema)
  } catch (err) {
    console.warn('sendBookingCreated error:', err.message);
  }
}

export async function sendBookingStatusChange(booking, newStatus) {
  initEmail(); initSms();
  try {
    const user = await User.findById(booking.userId).lean();
    if (user?.email) {
      const subject = `Booking ${newStatus}: ${booking.roomId?.name || ''}`;
      const text = `Your booking for ${booking.roomId?.name || 'a room'} on ${new Date(booking.startTime).toLocaleString()} is now ${newStatus}.`;
      await sendEmail(user.email, subject, text);
    }
  } catch (err) {
    console.warn('sendBookingStatusChange error:', err.message);
  }
}

// Scheduler: find bookings starting in configured minutesBefore window and notify if not already notified
export function scheduleReminders() {
  initEmail(); initSms();
  if (!config.notifications.reminders.enabled) return;

  cron.schedule(config.notifications.reminders.schedule, async () => {
    try {
      const minutesBefore = config.notifications.reminders.minutesBefore;
      const windowStart = new Date(Date.now() + (minutesBefore - 30) * 60 * 1000); // 30 min tolerance
      const windowEnd = new Date(Date.now() + (minutesBefore + 30) * 60 * 1000);

      const bookings = await Booking.find({
        startTime: { $gte: windowStart, $lte: windowEnd },
        status: { $in: ['approved', 'confirmed'] },
        $or: [ { lastReminderSentAt: { $exists: false } }, { lastReminderSentAt: null } ]
      }).populate('roomId userId');

      for (const b of bookings) {
        const email = b.userId?.email;
        if (email) {
          const subject = `Reminder: Upcoming booking for ${b.roomId?.name}`;
          const text = `This is a reminder for your booking at ${new Date(b.startTime).toLocaleString()} in ${b.roomId?.name}.`;
          await sendEmail(email, subject, text);
        }

        b.lastReminderSentAt = new Date();
        await b.save();
      }
    } catch (err) {
      console.warn('Reminder cron error:', err.message);
    }
  });
}

export default { sendBookingCreated, sendBookingStatusChange, scheduleReminders };
