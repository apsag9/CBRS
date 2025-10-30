import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4001,  // Changed from 4000 to 4001
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
  }
};
