# Nexmo Example (In-App messaging from Vonage)

This is a quick example (WIP) for using nexmo beta API for sending custom events.

## Instalation

- Create a nexmo application (get AppId, private.key and public.key)
- Add the necessary environment variables, copy `backend/ENV.EXAMPLE` into `backend/.env` and add the necessary variables

```sh

NEXMO_API_KEY=<YOUR NEXMO API KEY>
NEXMO_SECRET=<YOUR NEXMO SECRET>
APPLICATION_ID=<YOUR APPLICATION ID>

```

- Add at least your `private.key` file inside the `/backend` folder
- Add dependencies:

```sh
cd backend
yarn install

cd ../frontend
yarn install
```

## How to run

### Run the client:

```sh
cd frontend
yarn start
```

### Run the backend:

```sh
cd backend
yarn dev # or start
```
