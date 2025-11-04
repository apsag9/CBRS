import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/confo_champs',
  jwtSecret: process.env.JWT_SECRET || '904367d7f4cff6ac37b264539750a48b8a639e729f4480544623c5f3130985ad32627d60802a7681a0546fd53aef05b48df18192ade396aba3e241da69550033',
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  },
  https: {
    enabled: process.env.ENABLE_HTTPS === 'true',
    cert: process.env.SSL_CERT_PATH,
    key: process.env.SSL_KEY_PATH
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
    loginMaxRequests: 5 // limit login attempts to 5 per windowMs
  }
  ,
  notifications: {
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM || 'no-reply@confo-champs.local'
    },
    sms: {
      enabled: process.env.SMS_ENABLED === 'true',
      provider: process.env.SMS_PROVIDER || 'twilio',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioFrom: process.env.TWILIO_FROM
    },
    reminders: {
      enabled: process.env.REMINDERS_ENABLED === 'true',
      // minutes before booking start to send reminder (default 1440 = 24h)
      minutesBefore: parseInt(process.env.REMINDERS_MINUTES_BEFORE || '1440', 10),
      // cron schedule for reminder worker; default: every 30 minutes
      schedule: process.env.REMINDERS_CRON || '*/30 * * * *'
    }
  }
};