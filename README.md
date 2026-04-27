# 🤝 Helplystack — Community Support Platform

> **SMIT Grand Coding Night · April 2026**  
> *"Writing code is not enough. Building a product is what truly matters."*

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Platform Pages](#-platform-pages)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Bonus Features](#-bonus-features)
- [Team](#-team)
- [License](#-license)

---

## 🌐 Overview

**Helplystack** is a multi-page, community-driven support platform built to bridge the gap between people who **need help** and those who **can provide it**. Whether it's a coding question, a learning roadblock, or a skill-based challenge — Helplystack makes collaboration fast, structured, and rewarding.

---

## 🧩 Problem Statement

In today's learning ecosystem, a critical gap exists:

- 📚 **Students** struggle to find timely, relevant help
- 🙋 **Skilled individuals** are willing to help but lack a proper platform
- 🕳️ **No structured system** exists for asking help, offering help, or tracking contributions

This results in slower learning, missed opportunities, and weak community collaboration.

**Helplystack** solves this by providing a structured and community-driven platform for meaningful peer support.

---

## 🚀 Live Demo

> 🔗 **[helpify-hackathon-smit.vercel.app](https://helpify-hackathon-smit.vercel.app/)**

---

## ✨ Features

### Core Features
- ✅ Create and manage help requests
- ✅ Browse and filter community requests
- ✅ Mark requests as completed / solved
- ✅ Multi-page navigation with clean UX
- ✅ Role-based identity: *Need Help*, *Can Help*, or *Both*
- ✅ User profiles with skills, contributions & trust score

### Community Features
- 🏆 Leaderboard with rankings and badges
- 🔔 Notification system for request updates
- 💬 Messaging / interaction between users
- 👤 Profile with trust score and contribution history

---

## 📄 Platform Pages

| Page | Description |
|---|---|
| 🏠 **Landing Page** | Hero section, platform overview, stats & CTA |
| 🔐 **Authentication** | Login / Signup with role selection |
| 🧭 **Onboarding** | Name, skills, interests and location setup |
| 📊 **Dashboard** | Stats cards, recent requests, and quick actions |
| 🔍 **Explore / Feed** | All requests with filters (category, urgency, skills, location) |
| ➕ **Create Request** | Request form with tags, category, and urgency |
| 📋 **Request Detail** | Full description, helper list, and actions |
| 💬 **Messaging** | Basic communication between users |
| 🏆 **Leaderboard** | Top helpers, rankings, and badges |
| 🔔 **Notifications** | Real-time updates on requests and help status |
| 👤 **Profile** | User info, skills, contributions, trust score & badges |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ⚛️ Frontend Framework | React |
| 🎨 Styling | Tailwind CSS |
| 🔥 Backend & Database | Firebase (Auth + Firestore) |
| ☁️ Deployment | Vercel |

---

## 🏁 Getting Started

### Prerequisites
- Node.js `v18+`
- npm or yarn
- A Firebase project with Auth and Firestore enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/helplystack.git

# Navigate into the project
cd helplystack

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 🗂️ Project Structure

```
helplystack/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page-level components
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Explore.jsx
│   │   ├── CreateRequest.jsx
│   │   ├── RequestDetail.jsx
│   │   ├── Messages.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── Notifications.jsx
│   │   └── Profile.jsx
│   ├── firebase/           # Firebase config & helpers
│   ├── context/            # React context / state
│   ├── hooks/              # Custom React hooks
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── tailwind.config.js
├── vite.config.js
└── package.json
```

> *(Adjust folder names to match your actual structure)*

---

## 🎁 Bonus Features

- [x] 🏅 **Trust Score System** — Dynamic score based on helpful contributions
- [x] 🏆 **Leaderboard** — Community rankings with badge rewards
- [x] 🔔 **Notification System** — Request updates and status change alerts

---

## 👥 Team

| Name | Role |
|---|---|
| *Malik ALiyan* | Full Stack Developer / Product Builder |

> Built with 💙 at **SMIT Grand Coding Night — April 2026**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Helplystack** — *Connecting learners. Empowering helpers. Building community.*

⭐ Star this repo if you find it useful!

</div>
