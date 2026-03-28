# MR Ride - Microservices Architecture

MR Ride is a Node.js microservices backend for ride booking, with three domain services and one API gateway.

## Services Overview

- `user` service (`http://localhost:3001`)
  - User authentication and profile
  - JWT issue and token blacklist logout
- `captain` service (`http://localhost:3002`)
  - Captain authentication and profile
  - Availability toggle
  - Long polling endpoint for new rides
- `ride` service (`http://localhost:3003`)
  - Ride creation and ride lifecycle
  - Publishes new ride events to RabbitMQ
- `gateway` service (`http://localhost:3000`)
  - Single entrypoint for clients
  - Reverse proxy to all domain services

## High-Level Architecture

```text
Client Apps
    |
    v
API Gateway (:3000)
  |      |      |
  v      v      v
User   Captain  Ride
:3001   :3002   :3003
                 |
                 v
              RabbitMQ
                 |
                 v
        Captain long-poll listeners

Each service has its own MongoDB connection.
```

## Communication Model

### 1) Synchronous HTTP

Client calls only the Gateway.
Gateway forwards requests to the target service:

- `/api/users/*` -> user service
- `/api/captains/*` -> captain service
- `/api/rides/*` -> ride service

Backward-compatible aliases are also available:

- `/user/*`, `/captain/*`, `/ride/*`

### 2) Asynchronous Eventing (RabbitMQ)

- Ride service publishes to queue: `new-ride`
- Captain service subscribes to `new-ride`
- Captain clients call long-poll endpoint (`/api/captains/new-ride`)
- When an event arrives, captain service responds immediately to waiting clients

This decouples ride creation from captain notification.

## Authentication and Authorization

- User and captain services issue JWT tokens after login/register.
- Tokens are stored in cookies and can also be sent as bearer tokens.
- Logout blacklists tokens in each auth service.
- Ride service validates JWT and role claim:
  - `role: user` for rider actions
  - `role: captain` for captain actions

## Core API Endpoints (Via Gateway)

### User

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/logout`
- `GET /api/users/profile`

### Captain

- `POST /api/captains/register`
- `POST /api/captains/login`
- `POST /api/captains/logout`
- `GET /api/captains/profile`
- `PUT /api/captains/toggle-availability`
- `GET /api/captains/new-ride` (long polling, up to 30s)

### Ride

- `POST /api/rides/create-ride` (user)
- `GET /api/rides/my-rides` (user)
- `PATCH /api/rides/:rideId/accept` (captain)
- `PATCH /api/rides/:rideId/complete` (captain)

## Data Ownership

- User data is owned by user service.
- Captain data is owned by captain service.
- Ride data is owned by ride service.
- Services do not directly write each other's databases.
- Cross-service updates are done by API calls or events.

## Configuration

### User/Captain/Ride common variables

- `PORT`
- `MONGO_URI` (or `MONGO_URL` for ride db module)
- `JWT_SECRET`
- `RABBITMQ_URL`

### Gateway variables

See `gateway/.env.example`:

- `PORT=3000`
- `USER_SERVICE_URL=http://localhost:3001`
- `CAPTAIN_SERVICE_URL=http://localhost:3002`
- `RIDE_SERVICE_URL=http://localhost:3003`

## Run the Project

Start RabbitMQ and MongoDB first.

Then install dependencies and run each service in separate terminals:

```bash
cd user && npm install && npm run dev
cd captain && npm install && npm run dev
cd ride && npm install && npm run dev
cd gateway && npm install && npm run dev
```

If you prefer production mode:

```bash
npm start
```

inside each service folder.

## Request Flow Example: Create Ride to Captain Notification

1. User creates ride: `POST /api/rides/create-ride`
2. Ride service stores ride in MongoDB
3. Ride service publishes `new-ride` event to RabbitMQ
4. Captain service consumer receives event
5. Captain service replies to waiting long-poll requests
6. Captain client receives new ride payload and can accept the ride

## Notes

- Gateway has `/health` endpoint for quick health checks.
- Unknown gateway routes return JSON `404`.
- If upstream service is down, gateway returns JSON `502`.
