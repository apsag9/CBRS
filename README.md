# Conference room booking system

**Project ID:** P17  
**Course:** UE23CS341A  
**Academic Year:** 2025  
**Semester:** 5th Sem  
**Campus:** RR  
**Branch:** CSE  
**Section:** D  
**Team:** Confo Champs

## 📋 Project Description

An app to manage a number of conference rooms in any organization including colleges.

This repository contains the source code and documentation for the Conference room booking system project, developed as part of the UE23CS341A course at PES University.

## 🧑‍💻 Development Team (Confo Champs)

- [@Hars03082005](https://github.com/Hars03082005) - Scrum Master
- [@apsag9](https://github.com/apsag9) - Developer Team
- [@Durga07Prasad](https://github.com/Durga07Prasad) - Developer Team
- [@akshayabhagya78](https://github.com/akshayabhagya78) - Developer Team

## 👨‍🏫 Teaching Assistant

- [@Crashbadger24](https://github.com/Crashbadger24)
- [@Srujkul](https://github.com/Srujkul)
- [@srishmath](https://github.com/srishmath)

## 👨‍⚖️ Faculty Supervisor

- [@sapnavm](https://github.com/sapnavm)


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/pestechnology/PESU_RR_CSE_D_P17_Conference_room_booking_system_Confo-Champs.git
   cd PESU_RR_CSE_D_P17_Conference_room_booking_system_Confo-Champs
   ```

2. Install dependencies
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Environment (backend)
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env if needed: PORT, MONGO_URI, JWT_SECRET
   ```

4. Run the application
   ```bash
   # Terminal A - backend (from repo root)
   cd backend
   npm run dev

   # Terminal B - frontend (from repo root)
   cd frontend
   npm start
   ```

## 📁 Project Structure

```
PESU_RR_CSE_D_P17_Conference_room_booking_system_Confo-Champs/
├── backend/
│   ├── src/
│   │   ├── index.js          # server entry (placeholder)
│   │   ├── routes.js         # routes (placeholder)
│   │   ├── controllers.js    # controllers (placeholder)
│   │   ├── models.js         # data models (placeholder)
│   │   ├── services.js       # services (placeholder)
│   │   ├── validators.js     # validators (placeholder)
│   │   └── config.js         # config (placeholder)
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html        # static html (placeholder)
│   └── src/
│       ├── index.jsx         # app entry (placeholder)
│       ├── App.jsx           # root component (placeholder)
│       ├── api.js            # api client (placeholder)
│       └── pages/            # feature pages (placeholders)
│           ├── Auth/
│           │   ├── Login.jsx
│           │   └── Register.jsx
│           ├── Rooms/
│           │   ├── RoomList.jsx
│           │   └── RoomDetails.jsx
│           ├── Bookings/
│           │   ├── BookingForm.jsx
│           │   └── BookingHistory.jsx
│           ├── Reports/
│           │   ├── AdminDashboard.jsx
│           │   └── ReportsPage.jsx
│           └── NotFound.jsx
├── docs/
│   └── backlog/
│       ├── SPRINT_1.md
│       └── SPRINT_2.md
├── .github/
├── .gitignore
└── README.md
```

## 🛠️ Development Guidelines

### Branching Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Messages
Follow conventional commit format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test-related changes

### Code Review Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Create Pull Request to `develop`
4. Request review from team members
5. Merge after approval

## 📚 Documentation

- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📄 License

This project is developed for educational purposes as part of the PES University UE23CS341A curriculum.

---

**Course:** UE23CS341A  
**Institution:** PES University  
**Academic Year:** 2025  
**Semester:** 5th Sem
