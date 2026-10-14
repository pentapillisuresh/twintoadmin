# TWINTO Admin Dashboard

React + Vite + Tailwind CSS. All business screens use the TWINTO Node/Express API; there is no dummy data.

## Setup
npm install
copy .env.example .env
npm run dev

Set VITE_API_URL to your backend, e.g. http://localhost:5000/api/v1

## Backend requirement
Admin login must exist at POST /admin/auth/login and return a JWT and admin user. The backend User model needs password for email/password admin authentication.
