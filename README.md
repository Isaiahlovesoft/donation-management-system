# Donation Management System

## Overview
The Donation Management System is a full-stack application designed to streamline the processing and management of donations for nonprofits. It features a robust backend API for handling donation data and a user-friendly frontend dashboard for internal users to view and update donation statuses.

---

## Features

### Backend
- **Framework**: Built with **Express.js** and **TypeScript**.
- **Endpoints**:
  - `POST /donations`: Ingest and process new donations.
  - `GET /donations`: Retrieve all donations.
  - `GET /donations/:uuid`: Retrieve a specific donation by UUID.
  - `PATCH /donations/:uuid/status`: Update the status of a donation with validation.
- **Core Functionalities**:
  - Idempotent donation processing to prevent duplicates.
  - Validation of status transitions to ensure data integrity.
  - In-memory data storage for simplicity and speed.

### Frontend
- **Framework**: Built with **React** and **Vite**.
- **Styling**: Utilizes **Tailwind CSS** for rapid and consistent design.
- **Dashboard Features**:
  - View all donations with details such as status, amount, payment method, and nonprofit.
  - Update donation statuses with valid transitions.
  - Clear error handling for API responses.
- **Reusable Components**: Modular design for maintainability and scalability.

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd donation-management-system
   ```
2. Install dependencies for both backend and frontend:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

---

## Usage

### Backend
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. The backend will run on `http://localhost:3000`.

### Frontend
1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. The frontend will run on `http://localhost:5173`.

---

## Data Model
The application uses the following TypeScript interface for donations:
```typescript
type PaymentMethod = "cc" | "ach" | "crypto" | "venmo";
type DonationStatus = "new" | "pending" | "success" | "failure";

interface Donation {
  uuid: string;
  amount: number;
  currency: "USD";
  paymentMethod: PaymentMethod;
  nonprofitId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}
```

---

## Sample Data
The backend is seeded with the following sample donations:
- `$50.00` via credit card (status: new)
- `$100.00` via ACH (status: new)
- `$250.00` via crypto (status: pending)
- `$15.00` via Venmo (status: pending)

---

## Status Transitions
The application enforces the following valid status transitions:
- `new → pending`
- `pending → success`
- `pending → failure`

Any other transitions will result in a `422 Unprocessable Entity` error.

---

## Future Improvements
- Replace the in-memory store with a persistent database (e.g., PostgreSQL).
- Add filtering, sorting, and analytics to the dashboard.
- Implement webhook notifications for external integrations.
- Deploy the application to a cloud platform with CI/CD pipelines.