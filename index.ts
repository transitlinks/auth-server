import { getLog } from './log';
const log = getLog('auth-server');

import express from 'express';
import expressSession from 'express-session';
import pgSessionStore from 'connect-pg-simple';
import bodyParser from 'body-parser';
import passport from 'passport';

import { initStrategies } from './passport';
import { Pool } from 'pg';

const pgSession = pgSessionStore(expressSession);
const poolSettings: { [key: string ]: string | number | object } = {
  max: 10,
  connectionString: process.env.DB_URL
};

if (process.env.APP_ENV === 'stage') {
  poolSettings.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolSettings);

const app = express();

app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
  store: new pgSession({
    pool
  }),
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

initStrategies(passport);

app.get('/auth/test', async (req, res, next) => {
  res.status(200).send({ test: 'test '});
});

app.post('/auth/login', (req, res, next) => {
  passport.authenticate('login-local',
    (err, user, info) => {
      if (err) {
        return res.status(401).send({ message: err.message });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.status(200).send({ user });
      });

    })(req, res, next);
  });

app.get('/auth/facebook',
  passport.authenticate(
    'login-facebook',
    { scope: [ 'email', 'public_profile' ], session: false }
  ));

app.get('/auth/facebook/callback',
  passport.authenticate('login-facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/auth/google',
  passport.authenticate(
    'login-google',
    { scope: [ 'email', 'profile' ], session: false }
  ));

app.get('/auth/google/callback',
  passport.authenticate('login-google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/auth/user', (req, res) => {
  console.log(req.session.id);
  console.log('has auth', req.isAuthenticated(), req.user);
  if (req.isAuthenticated()) {
    res.status(200).send({ user: req.user });
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
});

app.get('/auth/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

const port = process.env.AUTH_HTTP_PORT || 6100;
app.listen(port, () => console.log('App listening on port ' + port));
