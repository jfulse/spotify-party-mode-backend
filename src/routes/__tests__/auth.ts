import request from 'supertest';

import app from '../../server';
import intializeDB from '../../db';
import { hash } from '../../utils';
import { clearDB, createUser, getToken } from '../../testUtils';

beforeAll(async () => {
  await intializeDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('Auth', () => {
  describe('login should', () => {
    test('fail without email', async () => {
      const password = 'testPassword';
      const hashedPassword = await hash(password);
      await createUser({ password: hashedPassword });

      const { text: token } = await request(app)
        .post('/auth/login')
        .send({ password })
        .expect(400);

      expect(token).toBeFalsy();
    });
    test('fail without password', async () => {
      const password = 'testPassword';
      const hashedPassword = await hash(password);
      const user = await createUser({ password: hashedPassword });

      const { text: token } = await request(app)
        .post('/auth/login')
        .send({ email: user.email })
        .expect(400);

      expect(token).toBeFalsy();
    });
    test('fail with wrong email', async () => {
      const password = 'testPassword';
      const hashedPassword = await hash(password);
      await createUser({ password: hashedPassword });

      const { text: token } = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong.email@example.com', password })
        .expect(401);

      expect(token).toBeFalsy();
    });
    test('fail with wrong password', async () => {
      const password = 'testPassword';
      const hashedPassword = await hash(password);
      const user = await createUser({ password: hashedPassword });

      const { text: token } = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: 'wrong password' })
        .expect(401);

      expect(token).toBeFalsy();
    });
    test('return token', async () => {
      const password = 'testPassword';
      const hashedPassword = await hash(password);
      const user = await createUser({ password: hashedPassword });

      const token = await getToken({ email: user.email, password });

      expect(token).toBeTruthy();
    });
  });
});