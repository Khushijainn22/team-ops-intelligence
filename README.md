# Team Operations & Decision Intelligence Platform

A unified internal tool that combines decision logging, workload planning, and meeting action tracking to improve team clarity, accountability, and execution—without relying on multiple disconnected tools.

## 🚀 The Problem

As teams grow, critical information gets scattered across tools and conversations.

- Teams forget why decisions were made.
- Context behind tradeoffs is lost over time.
- Managers struggle to understand who is overloaded and who has capacity.
- Meeting decisions and action items are often forgotten.
- This leads to poor execution, repeated mistakes, and burnout.

## 💡 The Solution

This platform provides a single source of truth to:

- **Preserve decision context and reasoning.**
- **Improve visibility into team workload and capacity.**
- **Prevent over-allocation and burnout.**
- **Ensure meeting outcomes turn into real actions.**
- **Help managers and teams execute with clarity and alignment.**

## ✨ Key Features

### ⚖️ Decision Log & Tradeoff Tracker

- Log architectural, technical, or product decisions.
- Capture context, constraints, and alternatives considered.
- Mark outcomes (successful, failed, revisited).
- Maintain a searchable history of past decisions.

### 📊 Team Workload & Capacity Planning

- Add team members and assign tasks.
- Estimate effort per task and track weekly workload.
- Identify overloaded or underutilized team members with real-time utilization metrics.

### 🤝 Meeting Intelligence & Action Tracking

- Record meetings with agendas and outcomes.
- Assign action items with multiple owners and deadlines.
- Track pending and overdue actions across all meetings in a centralized view.

### 🏠 Execution & Visibility Dashboard

- High-level overview of active decisions, tasks, and actions.
- Automatic highlighting of upcoming deadlines and overdue items.
- Team workload visualization.

## 🛠 Tech Stack

### Backend

- **Node.js & Express**: Fast and minimalist web framework.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling and relationship management.

### Frontend

- **React**: Component-based UI development.
- **Vite**: Ultra-fast build tool and development server.
- **React Router**: Client-side routing for a seamless SPA experience.
- **Axios**: Clean API communication.
- **React Icons**: Comprehensive icon set for a modern UI.
- **Custom CSS**: Clean, modern, and responsive design with dark/light mode support.

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Backend Setup

1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
.
├── backend/
│   ├── models/      # Mongoose schemas (Action, Decision, Meeting, Member, Task)
│   ├── routes/      # Express API endpoints
│   └── server.js    # Entry point
└── frontend/
    ├── src/
    │   ├── api/     # Axios client configuration
    │   ├── pages/   # Application views (Dashboard, Actions, Decisions, Meetings, Tasks, Team)
    │   ├── App.jsx  # Main application logic
    │   └── index.css# Global styles and theme variables
    └── index.html
```
