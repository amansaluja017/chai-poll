# Chai Poll ☕

Chai Poll is a modern, real-time polling application designed to make community engagement seamless and interactive. Built with a responsive glassmorphism UI, it allows creators to design both multiple-choice and text-based polls, and immediately see live results as participants submit their answers.


## 🚀 Key Features

- **Real-Time Synchronization**: Watch votes pour in live. The dashboard instantly updates using WebSockets without needing a page refresh.
- **Dynamic Question Types**: Support for standard Multiple Choice questions and open-ended Text questions.
- **Interactive Analytics**: Results are beautifully visualized using Recharts Donut charts and animated progress bars.
- **Text Response Board**: Open-ended answers are displayed dynamically with varying sizes and colors on an interactive canvas.
- **Time-bound Polls**: Set expiration times on your polls with a live countdown timer.
- **Guest Participation**: Participants can answer polls seamlessly without needing an account.
- **High Performance**: Poll configurations are cached in Redis to minimize database lookups.
- **Glassmorphism UI**: A sleek, modern aesthetic using Tailwind CSS v4.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 (via Vite)
- **Routing**: TanStack Router (Start)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI, Lucide React, FontAwesome
- **State Management**: Redux Toolkit & Redux Persist
- **Data Visualization**: Recharts
- **Real-time**: Socket.io-client

### Backend (Server)
- **Environment**: Node.js & Bun
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Caching & Session**: Redis
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod

## 📦 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js (v18+) or Bun
- MongoDB (Local or Atlas)
- Redis Server (Local or Cloud)

### 1. Clone the repository
```bash
git clone https://github.com/amansaluja017/chai-poll.git
cd chai-poll
```

### 2. Set up the Server
Navigate to the `server` directory and configure the environment:
```bash
cd server
bun install
```
Create a `.env` file in the `server` directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
REDIS_HOST=your_redis_host
REDIS_PASSWORD=your_redis_password
REDIS_USERNAME=default
CLIENT_URL=http://localhost:3000
```
Start the server:
```bash
bun dev
```

### 3. Set up the Client
Navigate to the `client` directory:
```bash
cd ../client
bun install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:8000
VITE_CLIENT_URL=http://localhost:3000
```
Start the development server:
```bash
bun dev
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/amansaluja017/chai-poll/issues).

## 📄 License
This project is open-source and available under the MIT License.
