const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the Contact model before requiring the controller
jest.mock('../models/Contact', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
}));

const identifyController = require('../controllers/identify');

// Create a test app
const app = express();
app.use(bodyParser.json());
app.post('/api/identify', identifyController.handleIdentify);

describe('Identify Endpoint Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should create new primary contact when no matches found', async () => {
    // Mock database responses
    const Contact = require('../models/Contact');
    Contact.findAll.mockResolvedValue([]);
    Contact.create.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      phoneNumber: '1234567890',
      linkPrecedence: 'primary'
    });

    const response = await request(app)
      .post('/api/identify')
      .send({
        email: 'test@example.com',
        phoneNumber: '1234567890'
      });

    expect(response.status).toBe(200);
    expect(response.body.contact).toEqual({
      primaryContactId: 1,
      emails: ['test@example.com'],
      phoneNumbers: ['1234567890'],
      secondaryContactIds: []
    });
  });

  test('should return 400 when no email or phone provided', async () => {
    const response = await request(app)
      .post('/api/identify')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('At least one of email or phoneNumber is required');
  });

  test('should link secondary contact when matching primary exists', async () => {
    const Contact = require('../models/Contact');
    // Mock existing primary contact
    const primaryContact = {
      id: 1,
      email: 'primary@example.com',
      phoneNumber: '1234567890',
      linkPrecedence: 'primary',
      update: jest.fn().mockResolvedValue()
    };
    const secondaryContact = {
      id: 2,
      email: 'secondary@example.com',
      phoneNumber: '1234567890',
      linkPrecedence: 'secondary',
      linkedId: 1,
      update: jest.fn().mockResolvedValue()
    };

    // First call: only primary exists, second call: both primary and new secondary
    Contact.findAll
      .mockImplementationOnce(() => Promise.resolve([primaryContact]))
      .mockImplementationOnce(() => Promise.resolve([primaryContact, secondaryContact]));
    Contact.create.mockResolvedValue(secondaryContact);

    const response = await request(app)
      .post('/api/identify')
      .send({
        email: 'secondary@example.com',
        phoneNumber: '1234567890'
      });

    expect(response.status).toBe(200);
    expect(response.body.contact).toEqual({
      primaryContactId: 1,
      emails: ['primary@example.com', 'secondary@example.com'],
      phoneNumbers: ['1234567890'],
      secondaryContactIds: [2]
    });
  });

  test('should merge contacts when matching multiple contacts', async () => {
    const Contact = require('../models/Contact');
    // Mock existing contacts
    const primaryContact = {
      id: 1,
      email: 'primary@example.com',
      phoneNumber: '1234567890',
      linkPrecedence: 'primary',
      update: jest.fn().mockResolvedValue()
    };

    const secondaryContact = {
      id: 2,
      email: 'secondary@example.com',
      phoneNumber: '1234567890',
      linkPrecedence: 'secondary',
      linkedId: 1,
      update: jest.fn().mockResolvedValue()
    };

    const newContact = {
      id: 3,
      email: 'new@example.com',
      phoneNumber: '9876543210',
      linkPrecedence: 'secondary',
      linkedId: 1,
      update: jest.fn().mockResolvedValue()
    };

    // First call: primary and secondary exist, second call: all three
    Contact.findAll
      .mockImplementationOnce(() => Promise.resolve([primaryContact, secondaryContact]))
      .mockImplementationOnce(() => Promise.resolve([primaryContact, secondaryContact, newContact]));
    Contact.create.mockResolvedValue(newContact);

    const response = await request(app)
      .post('/api/identify')
      .send({
        email: 'new@example.com',
        phoneNumber: '9876543210'
      });

    expect(response.status).toBe(200);
    expect(response.body.contact).toEqual({
      primaryContactId: 1,
      emails: ['primary@example.com', 'secondary@example.com', 'new@example.com'],
      phoneNumbers: ['1234567890', '9876543210'],
      secondaryContactIds: [2, 3]
    });
  });

  test('should handle error gracefully', async () => {
    const Contact = require('../models/Contact');
    // Mock database error
    Contact.findAll.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/identify')
      .send({
        email: 'test@example.com',
        phoneNumber: '1234567890'
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
}); 