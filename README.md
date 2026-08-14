# MWM Trading Championship 2026

This is the codebase for the **MWM Trading Championship 2026** web application. It features a verified, real-time leaderboard linked to Delta Exchange API keys, user dashboards for registration and API verification, and a secure Admin Command Center to manage users and competitions.

---

## 🚀 Quick Start Guide

Follow these steps to run both the frontend and backend servers locally.

### 1. Start the Backend API (Port 8000)

The backend is built with FastAPI and SQLite.

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\activate
     ```
   * **Windows (CMD):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```
3. Run the database seed script to set up mock active contests and participants:
   ```bash
   python seed_db.py
   ```
4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * The API and documentation will be live at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

### 2. Start the Frontend (Port 3000)

The frontend is a lightweight, high-performance static application (HTML5/CSS3/Vanilla JS). You can serve it using Python's built-in HTTP server module.

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the static server:
   ```bash
   python -m http.server 3000 --bind 127.0.0.1
   ```
3. Open your browser and navigate to: **[http://127.0.0.1:3000](http://127.0.0.1:3000)**

---

## 👑 Administrative Setup & RBAC

The system implements Role-Based Access Control (RBAC) to restrict management functions to `admin` users. 

### Seed Admin Credentials
To log in immediately with administrative rights, use:
* **Email:** `testerman@gmail.com`
* **Password:** `Password123`

---

### How to Create or Promote Admin Users

There are three ways to create administrators:

#### Method A: Via the Admin Panel UI (Recommended)
1. Log in to the application on port 3000 with your admin credentials.
2. Go to the **Admin Panel** in the navigation header.
3. In the **User Accounts Directory** table, click **Make Admin** next to any regular user.

#### Method B: Via Command-Line One-Liner
Navigate to the `backend` directory and run the corresponding script command:

* **Create a brand new Admin user:**
  ```powershell
  python -c "from app.database import SessionLocal; from app.models.user import User; from app.core.security import get_password_hash; db = SessionLocal(); user = User(email='admin@example.com', full_name='System Admin', hashed_password=get_password_hash('AdminPassword123'), role='admin'); db.add(user); db.commit(); db.close(); print('Admin user created successfully!')"
  ```
* **Promote an existing user:**
  ```powershell
  python -c "from app.database import SessionLocal; from app.models.user import User; db = SessionLocal(); user = db.query(User).filter(User.email == 'user@example.com').first(); user.role = 'admin'; db.commit(); db.close(); print('User successfully promoted to Admin!')"
  ```

#### Method C: Edit the Database Seed File
You can modify the seeding script in `backend/seed_db.py` to automatically include admin roles on launch:
```python
admin_user = User(
    email="admin@example.com",
    full_name="System Admin",
    hashed_password=get_password_hash("AdminPassword123"),
    role="admin"  # Enforce administrative role
)
db.add(admin_user)
db.commit()
```

---

## 🗑️ User Deletion Lifecycle (Soft & Hard Delete)

Admin users have access to a secure, two-stage deletion protocol:

1. **Soft Delete:**
   * Toggles the `is_deleted` flag to `True` on the user account.
   * **Result:** The user is immediately blocked from logging in or fetching session profiles. Their name is automatically hidden from all public leaderboard standings.
   * **Action:** Click **Soft Delete** (or **Restore** to reactivate) in the User Directory table.
2. **Hard Delete (Permanent):**
   * Purges the user record completely from the database.
   * **Result:** Cascades across all foreign key relationships to automatically delete all registered API keys, competition registrations, and historical leaderboard snapshot entries.
   * **Action:** Click **Hard Delete** in the User Directory table.
