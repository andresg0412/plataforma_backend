import { describe, it, expect } from 'vitest';
import { userController } from '../controllers/user.controller';

// Mock FastifyReply
const reply = () => {
  let statusCode = 200;
  let payload: any;
  return {
    status: (code: number) => { statusCode = code; return reply(); },
    send: (data: any) => { payload = data; return { statusCode, payload }; },
  };
};

describe('userController', () => {
  it('should create a user', async () => {
    const req: any = { body: { email: 'test@mail.com', name: 'Test' } };
    const res = await userController.create(req, reply() as any);
    expect(res.statusCode).toBe(201);
    expect(res.payload.email).toBe('test@mail.com');
  });
});
