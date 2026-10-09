# 🧪 Step-by-Step Testing Guide (For You to Verify)

This comprehensive guide details the step-by-step instructions to manually verify all recent changes made to the **MWM Trading Championship** application, including:
1. **Mandatory Unique Username System across Frontend & Backend**
2. **Leaderboard Display with Username & Dual Search**
3. **Admin User Account Verification (dbzdawood@gmail.com)**
4. **Full-Width Dashboard Profile Layout**

---

## 🚀 1. Local Environment & Server Setup

Ensure your local servers are active before beginning:

* **Backend FastAPI Server:** http://127.0.0.1:8000
  * Swagger Docs: http://127.0.0.1:8000/docs
  * Command to start if offline:
    `powershell
    cd e:\Coding-related\MackTSMG-TradingContest\backend
    .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
    `

* **Frontend SPA Server:** http://127.0.0.1:3000
  * Command to start if offline:
    `powershell
    cd e:\Coding-related\MackTSMG-TradingContest
    .\backend\venv\Scripts\python.exe server.py
    `

---

## 👥 2. Test Credentials Quick Reference

| Role | Email | Username | Password | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **New Admin** | dbzdawood@gmail.com | dbzdawood | edlight@101 | Newly created org admin account |
| **System Admin** | dmin@example.com | dmin | Password123 | Default seed admin |
| **Mack Admin** | dmin@marketswithmack.com | mack_admin | Password123 | Prototype admin |
| **Test Trader 1** | 	rader1@example.com | lpha_trader | Password123 | Ranked #1 competitor |
| **Test Trader 2** | 	rader2@example.com | ull_rider | Password123 | Ranked #2 competitor |
| **Test Trader 3** | 	rader3@example.com | crypto_ninja | Password123 | Ranked #3 competitor |

---

## 📋 3. Step-by-Step Verification Scenarios

### Step 1: Sign Up with Mandatory Username (Modal & Standalone Page)

1. Open your browser in Incognito or ensure you are logged out.
2. Navigate to http://127.0.0.1:3000/signup or click **Sign Up** in the navigation bar to open the registration modal.
3. **Verify UI:**
   * Confirm the **Username** field is displayed right below **Full Name** and above **Email Address**.
   * Confirm the @ handle prefix is present.
4. **Test Format Validation (Client-Side & Server-Side):**
   * Enter a username with fewer than 3 characters (e.g., b).
     * Expected: Field displays a warning: *"Username must be 3-20 characters long and contain only letters, numbers, and underscores"*.
   * Enter special characters or spaces (e.g., user name or cool@trader).
     * Expected: Field indicates invalid format.
   * Enter a valid format (e.g., zenith_trader).
     * Expected: Format error disappears.
5. **Test Uniqueness Validation (Duplicate Prevention):**
   * Fill out the form using an existing username:
     * **Full Name:** Duplicate Tester
     * **Username:** dmin (or dbzdawood or lpha_trader)
     * **Email:** 	emp_unique_test@example.com
     * **Password:** Password123
     * **Confirm Password:** Password123
   * Click **Create Account**.
     * Expected: Submission is blocked with an error banner: *"Username 'admin' is already taken. Please choose another."*
6. **Test Successful Account Creation:**
   * Change username to an unused handle (e.g. 	est_user_2026).
   * Click **Create Account**.
     * Expected: Account is successfully registered.

---

### Step 2: Dual Login Authentication (Email OR Username)

1. Navigate to http://127.0.0.1:3000/login (or click **Sign In** in the navigation bar).
2. **Verify UI:**
   * The first field label reads **"Email or Username"** (with placeholder 
ame@example.com or @username).
3. **Test Login via Username:**
   * In **Email or Username**, type: lpha_trader
   * In **Password**, type: Password123
   * Click **Sign In**.
     * Expected: Authenticates successfully and redirects to dashboard/home.
4. Log out via the profile menu in the navbar.
5. **Test Login via Email:**
   * In **Email or Username**, type: 	rader1@example.com
   * In **Password**, type: Password123
   * Click **Sign In**.
     * Expected: Authenticates successfully to the same account.
6. **Test Case-Insensitivity & Whitespace Trimming:**
   * Log out.
   * Try logging in with:   Alpha_Trader   (mixed case and extra spaces).
     * Expected: Authenticates seamlessly.

---

### Step 3: Public Leaderboard Display & Dual Search

1. Navigate to the Public Leaderboard: http://127.0.0.1:3000/leaderboard.
2. **Verify Competitor Identity Display:**
   * Check the **Trader** column in the rankings table.
   * Each entry displays @username alongside the full name:
     e.g., @alpha_trader (Alex Mercer), @bull_rider (Sarah Connor), @crypto_ninja (Dave K.).
3. **Test Search by Username:**
   * Type lpha_trader or @alpha into the leaderboard search bar.
     * Expected: Table instantly filters to show Alex Mercer (@alpha_trader).
4. **Test Search by Full Name:**
   * Clear the search and type Sarah.
     * Expected: Table instantly filters to show Sarah Connor (@bull_rider).
5. **Verify Mobile Responsiveness:**
   * Open Chrome DevTools (F12), toggle Device Toolbar (e.g., iPhone 12/14, 390px width).
   * Verify the @username and Full Name wrap cleanly without horizontal table breaking or overlapping text.

---

### Step 4: User Profile & Dashboard Step 1

1. Log in to http://127.0.0.1:3000/dashboard.
2. Open the **Profile** tab / Step 1 (Personal & Exchange Details).
3. **Verify Username Field:**
   * Confirm the **Username** input is populated with your current handle (e.g., @dbzdawood or @alpha_trader).
4. **Test Profile Update:**
   * Try entering an already taken username (e.g. dmin) and click save.
     * Expected: Displays error indicating the username is already taken.
   * Enter a new unique handle and save.
     * Expected: Success alert appears; top navbar greeting immediately updates to the new handle.

---

### Step 5: Navbar & Header Display

1. Look at the top navigation bar while logged in:
   * The greeting badge shows your @username.
   * Open the user settings dropdown:
     * Displays @username and your email address.

---

### Step 6: Admin Account Verification (dbzdawood@gmail.com) & Admin Portal

1. Log in with admin credentials:
   * **Email or Username:** dbzdawood@gmail.com (or dbzdawood)
   * **Password:** edlight@101
2. **Verify Admin Role Access:**
   * Confirm the **Admin** navigation badge/link is visible in the top header.
   * Click **Admin** or navigate to http://127.0.0.1:3000/admin.
3. Open the **Users Directory** table:
   * Verify every user row displays their unique @username handle next to their name and email.
   * In the Admin search bar, type a username (e.g., dbzdawood or crypto_ninja).
     * Expected: Table filters by username in real-time.

---

## ✅ Quick Verification Checklist

- [ ] **Admin Account Verification:**
  - [ ] Successfully logged in with dbzdawood@gmail.com / edlight@101.
  - [ ] Successfully logged in with @dbzdawood / edlight@101.
  - [ ] Confirmed Admin access to /admin page.

- [ ] **Username System:**
  - [ ] Sign Up modal/page requires a unique Username (3–20 chars).
  - [ ] Duplicate username registration produces clear error banner.
  - [ ] Sign In works with either Email or Username.
  - [ ] Public Leaderboard shows @username alongside Full Name.
  - [ ] Leaderboard search filters by @username.
  - [ ] Dashboard Profile displays and saves username.
  - [ ] Admin Portal displays username for all users in directory.
  - [ ] Mobile view maintains clean responsive wrapping with zero horizontal overflow.