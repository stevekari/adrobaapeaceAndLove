# Association Dues & Member Management Portal

A full-stack Association Management & Dues Portal featuring secure authentication, administrator registration, member self-service activation via unique Member Registration Codes, automated levy tracking, and tamper-proof printable receipts.

---

## 🚀 Quick Start

### Option A: Run Both Services with One Script
```bash
./start.sh
```

### Option B: Running Separately

#### 1. Backend (Spring Boot 3 + Java 21+):
```bash
cd backend
export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-26.jdk/Contents/Home"
mvn clean package -DskipTests
java -jar target/duesportal-backend-1.0.0.jar
```
_Backend runs on `http://localhost:8080`_

#### 2. Frontend (React 18 + Vite):
```bash
cd frontend
npm install
npm run dev
```
_Frontend runs on `http://localhost:3000`_

---

## 🔐 Authentication & Roles

### 1. Default Pre-Configured Test Accounts
| Role | Name | Identifier (Email or Code) | Password | Member Code | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | Stephen Karikari | `stephen.karikari@association.org` | `admin123` | `ADM-1001` | Active |
| **Treasurer** | Akosua Mensah | `treasurer.mensah@association.org` | `treasurer123` | `TRS-1002` | Active |
| **Member** | Kwame Boateng | `kwame.boateng@example.com` or `MEM-1003` | `member123` | `MEM-1003` | Active |
| **Member** | Abena Osei | `abena.osei@example.com` | _(Not set)_ | `MEM-1004` | *Pending Registration with Code* |
| **Member** | Kofi Appiah | `kofi.appiah@example.com` | _(Not set)_ | `MEM-1005` | *Pending Registration with Code* |
| **Member** | Ama Darko | `ama.darko@example.com` | _(Not set)_ | `MEM-1006` | *Pending Registration with Code* |

---

## 💡 Key Features & User Flows

1. **Sign In & Sign Out**:
   - Log in using either **Email Address** or **Member Code** with your password.
   - Quick one-click demo sign-in shortcuts for Admin, Treasurer, and Member.
   - Prominent, easy-to-use **Logout** buttons in the top navbar and sidebar.

2. **Admin Registration**:
   - New Administrators / Treasurers can register directly from the **Admin Sign Up** tab.
   - Creates an administrative user with an auto-assigned officer code (e.g. `ADM-XXXX`).

3. **Member Self-Activation via Member Code**:
   - Admins add members to the directory, and the system automatically assigns each member a unique **Registration Code** (e.g. `MEM-1004`).
   - Admins can copy this code with 1 click from the Member Directory.
   - Unregistered members visit the **Register with Code** tab, enter their code, verify their identity, and create their personal password to activate their account.

4. **Role-Adapted Experience**:
   - **Admins & Treasurers**: Full control over dues levies, member directory, recording payments for any member, and broadcasting notices.
   - **Members**: Personalized dashboard displaying dues compliance status, fast one-click dues payments pre-selected with their profile, and personal receipts history.

---

## 📂 Entity Schema & API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate via email or member code.
- `POST /api/auth/register-admin`: Register new Admin/Treasurer.
- `GET /api/auth/verify-code/{code}`: Verify registration code and preview member.
- `POST /api/auth/register-member`: Create password and activate account using member code.

### Member Management (`/api/members`)
- `GET /api/members`: List and search members.
- `GET /api/members/summaries`: Dues compliance summaries for all members.
- `GET /api/members/{id}`: Single member profile.
- `GET /api/members/code/{code}`: Lookup member by code.
- `GET /api/members/{id}/summary`: Financial ledger summary for a member.
- `POST /api/members`: Create member (auto-generates registration code).
- `PUT /api/members/{id}`: Update member profile.
- `DELETE /api/members/{id}`: Remove member.

### Dues Schedules & Levies (`/api/dues-schedules`)
- `GET /api/dues-schedules`: List all dues levies.
- `GET /api/dues-schedules/progress`: Real-time collection metrics per levy.
- `POST /api/dues-schedules`: Create schedule.
- `PUT /api/dues-schedules/{id}`: Update schedule.
- `DELETE /api/dues-schedules/{id}`: Delete schedule.

### Payments & Receipts (`/api/payments`)
- `GET /api/payments`: Search and list payments.
- `GET /api/payments/receipt/{receiptNumber}`: Retrieve receipt details.
- `POST /api/payments`: Record payment and issue printable receipt.
- `PATCH /api/payments/{id}/status`: Update payment verification status.

### Announcements (`/api/announcements`)
- `GET /api/announcements`: List association bulletins.
- `POST /api/announcements`: Publish announcement.
- `PUT /api/announcements/{id}`: Update announcement.
- `DELETE /api/announcements/{id}`: Delete announcement.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats`: Aggregated metrics and financial collection rates.
