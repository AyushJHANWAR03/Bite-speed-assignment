# Contact Identification Service

A Node.js service that helps identify and merge contact information based on email and phone number matches.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Language**: JavaScript

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/AyushJHANWAR03/Bite-speed-assignment
cd Bite-speed-assignment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=contact_db
PORT=3000
```

4. Create the database:
```bash
createdb contact_db
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the server:
```bash
npm start
```

The server will start running on `http://localhost:3000`

## API Documentation

### Identify Contact

**Endpoint:** `POST /api/identify`

**Request Body:**
```json
{
    "email": "example@email.com",
    "phoneNumber": "1234567890"
}
```

Note: At least one of `email` or `phoneNumber` is required.

**Response:**
```json
{
    "contact": {
        "primaryContactId": 1,
        "emails": ["example@email.com"],
        "phoneNumbers": ["1234567890"],
        "secondaryContactIds": [2, 3]
    }
}
```

## Testing

Run the test suite:
```bash
npm test
```

## API Testing Examples

Using cURL:
```bash
curl -X POST https://bite-speed-assignment.onrender.com/api/identify \
-H "Content-Type: application/json" \
-d '{"email": "example@email.com", "phoneNumber": "1234567890"}'
```

Using Postman:
1. Create a new POST request to `https://bite-speed-assignment.onrender.com/api/identify`
2. Set the Content-Type header to `application/json`
3. Add the request body in JSON format
4. Send the request

## Deployment

The application is deployed and accessible at: https://bite-speed-assignment.onrender.com

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 