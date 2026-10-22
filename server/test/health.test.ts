import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import app from '../src/app';
import { sendSuccess, sendError } from '../src/utils/response';

describe('Response Utility', () => {
  test('sendSuccess formats standard response payload', () => {
    let capturedStatus = 0;
    let capturedBody: unknown = null;

    const mockRes = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(payload: unknown) {
        capturedBody = payload;
        return this;
      },
    };

    sendSuccess(mockRes as any, { hello: 'world' }, 201);

    assert.equal(capturedStatus, 201);
    assert.deepEqual(capturedBody, {
      success: true,
      data: { hello: 'world' },
    });
  });

  test('sendError formats standard error payload', () => {
    let capturedStatus = 0;
    let capturedBody: unknown = null;

    const mockRes = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(payload: unknown) {
        capturedBody = payload;
        return this;
      },
    };

    sendError(mockRes as any, 'Something failed', 400, { field: 'email' });

    assert.equal(capturedStatus, 400);
    assert.deepEqual(capturedBody, {
      success: false,
      error: {
        message: 'Something failed',
        details: { field: 'email' },
      },
    });
  });
});

describe('HTTP Health Check API', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test('GET /health returns 200 and liveness status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
  });

  test('GET /api/v1/health returns 200 and liveness status ok', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
  });

  test('GET /health/ready returns 200 and checks: database ok when database is connected', async () => {
    const res = await fetch(`${baseUrl}/health/ready`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { status: string; checks: { database: string } } };
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ready');
    assert.equal(body.data.checks.database, 'ok');
  });
});
