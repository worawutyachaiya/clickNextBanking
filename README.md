# ClickNext Banking Application

Full-Stack ที่พัฒนาด้วย Vue.js, Node.js/Express, PostgreSQL และ Tailwind CSS

## Tech Stack

### Frontend
- **Vue.js 2.7.16** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Vuex** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Node.js v16.20.2** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### DevOps
- **Docker & Docker Compose** - Containerization
- **3 Container Architecture** (Frontend, Backend, Database)
- 
### Prerequisites
- Docker Desktop installed
- Node.js v16.20.2+ (for local development)


### Run with Docker Compose
- docker compose up -build

This will start:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **PostgreSQL Database**: localhost:5433


### บัญชีสำหรับทดสอบ
- **อีเมล**: test@example.com
- **รหัสผ่าน**: password
- **ยอดเริ่มต้น**: ฿50,000.00


## ความต้องการ

- Full Stack: Vue.js + Node.js + PostgreSQL
- ระบบล็อกอินพร้อมตรวจสอบอีเมล
- การทำธุรกรรม (ฝาก/ถอน)
- การจัดการรายการ (แก้ไข/ลบ)
- Responsive design ด้วย Tailwind CSS
- Docker containerization (3 containers)
- จัดการ session ผ่าน Local storage
- สถาปัตยกรรมแบบ Component-based

## .env
- NODE_ENV=development
- PORT=3001
- DB_HOST=localhost
- DB_PORT=5433(default 5432)
- DB_NAME=banking_db
- DB_USER=postgres
- DB_PASSWORD=1234
- JWT_SECRET=worawut013
- FRONTEND_URL=http://localhost:8080
