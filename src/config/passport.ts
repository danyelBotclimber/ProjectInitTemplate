import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { AppDataSource } from './database';
import { User } from '../entities/user.entity';

config();

const userRepository = AppDataSource.getRepository(User);

interface JwtPayload {
  id: string;
}

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key',
    } as StrategyOptionsWithoutRequest,
    async (payload: JwtPayload, done: any) => {
      try {
        const user = await userRepository.findOne({ where: { id: payload.id } });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userRepository.findOne({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await userRepository.save({
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            googleId: profile.id,
            isEmailVerified: true,
            isActive: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export const setupPassport = (app: any) => {
  app.use(passport.initialize());
}; 