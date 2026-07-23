import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

let mongo: MongoMemoryReplSet;
let token = '';
let refreshToken = '';
let companyId = '';

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await connectDatabase(mongo.getUri());
});
afterAll(async () => { await disconnectDatabase(); await mongo.stop(); });

describe('KrishiPath API', () => {
  it('reports health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('registers and authenticates a company root', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({ companyName: 'Test Agro Pvt Ltd', businessCategory: 'Seed', gst: '27ABCDE1234F1Z5', email: 'root@testagro.in', phone: '9876543210', contactName: 'Test Root', address: 'Pune, Maharashtra', state: 'Maharashtra', initialRecharge: 5000, password: 'testpass123' });
    expect(registration.status).toBe(201);
    companyId = registration.body.data.companyId;
    expect(companyId).toMatch(/^KP-C-/);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'root@testagro.in', password: 'testpass123' });
    expect(login.status).toBe(200);
    token = login.body.data.tokens.accessToken;
    refreshToken = login.body.data.tokens.refreshToken;
    expect(token).toBeTruthy();
  });

  it('rotates refresh tokens and returns the current user', async () => {
    const refreshed = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(refreshed.status).toBe(200);
    refreshToken = refreshed.body.data.refreshToken;
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.data.companyId).toBe(companyId);
  });

  it('creates, lists, pauses, duplicates, and deletes campaigns', async () => {
    const payload = { name: 'Cotton Growth Drive', goal: 'Product Awareness', description: 'Test campaign', videoReward: 2, quizReward: 5, brochureReward: 1, callbackReward: 20, dailyBudget: 1000, targetStates: ['Maharashtra'], targetCrops: ['Cotton'] };
    const created = await request(app).post('/api/v1/campaigns').set('Authorization', `Bearer ${token}`).send(payload);
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    const list = await request(app).get('/api/v1/campaigns').set('Authorization', `Bearer ${token}`);
    expect(list.body.data).toHaveLength(1);
    const paused = await request(app).post(`/api/v1/campaigns/${id}/pause`).set('Authorization', `Bearer ${token}`);
    expect(paused.body.data.status).toBe('paused');
    const duplicate = await request(app).post(`/api/v1/campaigns/${id}/duplicate`).set('Authorization', `Bearer ${token}`);
    expect(duplicate.status).toBe(201);
    expect(duplicate.body.data.status).toBe('draft');
    expect((await request(app).delete(`/api/v1/campaigns/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(204);
  });

  it('returns protected dashboard, wallet, notifications, and settings resources', async () => {
    for (const path of ['/api/v1/dashboard/kpi','/api/v1/wallet/summary','/api/v1/notifications','/api/v1/settings/rewards']) {
      const response = await request(app).get(path).set('Authorization', `Bearer ${token}`);
      expect(response.status, path).toBe(200);
      expect(response.body.success).toBe(true);
    }
  });

  it('performs wallet, team, targeting, reward, notification, and company admin workflows', async () => {
    const topup = await request(app).post('/api/v1/wallet/topup').set('Authorization', `Bearer ${token}`).send({ amount: 1000, paymentMethod: 'upi', gatewayReference: 'test-ref-1' });
    expect(topup.status).toBe(201);
    expect(topup.body.data.balance).toBe(6000);

    const invitation = await request(app).post('/api/v1/team/invite').set('Authorization', `Bearer ${token}`).send({ name: 'Campaign User', email: 'campaign@testagro.in', role: 'Campaign Manager', permissions: ['campaigns','leads','analytics'] });
    expect(invitation.status).toBe(201);
    expect(invitation.body.data.member.status).toBe('invited');
    const accepted = await request(app).post('/api/v1/auth/accept-invite').send({ token: invitation.body.data.invitationToken, password: 'memberpass123' });
    expect(accepted.status).toBe(200);

    const rewards = await request(app).put('/api/v1/settings/rewards').set('Authorization', `Bearer ${token}`).send({ rewards: [{ id: 'video', label: 'Video Watch Reward', amount: 3, enabled: true }] });
    expect(rewards.status).toBe(200);
    const segment = await request(app).post('/api/v1/settings/segments').set('Authorization', `Bearer ${token}`).send({ name: 'Kharif Segment 2026', states: ['Maharashtra','Punjab'], crops: ['Cotton','Wheat'], language: 'Hindi' });
    expect(segment.status).toBe(201);
    expect(segment.body.data.estimatedAudience).toBe(72000);

    expect((await request(app).post('/api/v1/notifications/mark-all-read').set('Authorization', `Bearer ${token}`)).status).toBe(200);
    const companies = await request(app).get('/api/v1/companies').set('Authorization', `Bearer ${token}`);
    expect(companies.status).toBe(200);
    expect(companies.body.data).toHaveLength(1);
    const exportResponse = await request(app).get('/api/v1/companies/export/csv').set('Authorization', `Bearer ${token}`);
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers['content-type']).toContain('text/csv');
  });

  it('rejects protected requests without a token', async () => {
    expect((await request(app).get('/api/v1/campaigns')).status).toBe(401);
  });
});
