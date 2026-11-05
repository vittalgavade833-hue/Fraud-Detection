# 🛡️ FraudShield AI – Intelligent Financial Fraud Detection System

An AI-powered financial fraud detection platform that analyzes financial transactions and identifies potentially fraudulent activities using Machine Learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)
![React](https://img.shields.io/badge/react-18-61dafb.svg)

## 🚀 Features

- **AI-Powered Fraud Detection** – Uses Isolation Forest + Random Forest ensemble for real-time fraud analysis
- **Risk Scoring** – Generates fraud risk scores (0-100) with LOW/MEDIUM/HIGH classification
- **Explainable AI** – Provides specific reasons why a transaction is flagged as suspicious
- **Real-time Dashboard** – Interactive charts and statistics for fraud monitoring
- **Transaction Management** – Submit, track, and analyze financial transactions
- **Alert System** – Automated fraud alerts with investigation workflow
- **Admin Dashboard** – Comprehensive admin panel for user and fraud management
- **Analytics & Reports** – Interactive visualizations with CSV export
- **Dark/Light Mode** – Premium fintech UI with theme switching
- **Role-Based Access** – Separate user and admin access levels

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React.js  │────▶│  Express.js │────▶│  Flask/ML   │
│  Frontend   │◀────│   Backend   │◀────│   Service   │
│  Port 3000  │     │  Port 5000  │     │  Port 5001  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │  Port 27017 │
                    └─────────────┘
```

## 📁 Project Structure

```
fraudshield-ai/
├── frontend/                 # React.js Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── services/         # API service layer
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom hooks
│   │   └── assets/           # Static assets
│   └── package.json
├── backend/                  # Node.js/Express Backend
│   ├── controllers/          # Route controllers
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middleware/            # Auth, validation, error handling
│   ├── config/               # Database configuration
│   ├── server.js             # Express server entry point
│   └── package.json
├── ml-service/               # Python ML Service
│   ├── app.py                # Flask API server
│   ├── train_model.py        # Model training script
│   ├── fraud_model.pkl       # Trained ML model
│   ├── scaler.pkl            # Feature scaler
│   ├── dataset/              # Synthetic training data
│   └── requirements.txt
└── README.md
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| ML/AI | Python, Scikit-learn, Flask |
| Auth | JWT, bcrypt |
| ML Models | Isolation Forest + Random Forest Ensemble |

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (running on localhost:27017)
- npm or yarn

### 1. Clone & Setup

```bash
cd fraudshield-ai
```

### 2. Start ML Service

```bash
cd ml-service
pip install -r requirements.txt
python dataset/generate_dataset.py    # Generate synthetic training data
python train_model.py                  # Train the ML model
python app.py                          # Start Flask API on port 5001
```

### 3. Start Backend

```bash
cd backend
npm install
node seed.js                           # (Optional) Seed database with sample data
npm run dev                            # Start Express server on port 5000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start                              # Start React app on port 3000
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **ML Service**: http://localhost:5001

### Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fraudshield.com | admin123 |
| User | user1@test.com | user123 |
| User | user2@test.com | user123 |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transactions | Create & analyze transaction |
| GET | /api/transactions | Get user's transactions |
| GET | /api/transactions/stats | Get transaction statistics |
| GET | /api/transactions/:id | Get transaction details |

### Fraud Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/fraud/analyze | Analyze transaction for fraud |
| GET | /api/fraud/alerts | Get fraud alerts |
| PUT | /api/fraud/alerts/:id/status | Update alert status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Admin dashboard stats |
| GET | /api/admin/users | List all users |
| GET | /api/admin/trends | Fraud trends data |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/daily-volume | Daily transaction volume |
| GET | /api/analytics/weekly-trends | Weekly fraud trends |
| GET | /api/analytics/risk-distribution | Risk level breakdown |

## 🤖 ML Model Details

> **⚠️ Demo Model Notice**: This system uses a demo ML model trained on synthetic data. The predictions are for demonstration purposes and should not be used for actual financial fraud detection in production.

### Features Analyzed
- Transaction amount deviation from user average
- Transaction time patterns (unusual hours)
- Location change velocity (impossible travel detection)
- Transaction frequency (velocity checks)
- Device change patterns
- New device/location flags
- International transaction risk
- IP reputation scoring

### Model Architecture
- **Isolation Forest**: Anomaly detection for identifying outliers
- **Random Forest Classifier**: Classification with feature importance
- **Ensemble**: Combined scoring for robust predictions

### Risk Classification
| Score Range | Level | Description |
|-------------|-------|-------------|
| 0-30 | LOW | Normal transaction |
| 31-70 | MEDIUM | Suspicious, requires review |
| 71-100 | HIGH | Potential fraud, investigate |

## 🔒 Security

- JWT-based authentication
- bcrypt password hashing
- Role-based access control
- API rate limiting
- Helmet security headers
- Input validation
- Environment variables for secrets
- CORS configuration

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by FraudShield AI Team

