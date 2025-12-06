# Crowngate Dental Lab Portal - Project Documentation

## 1. Project Overview
This application is a centralized digital management system for Crowngate Dental Laboratory. It replaces manual order tracking with a role-based web portal that connects Doctors (Clinics), Lab Technicians, and Administrators.

**Core Concept:** The "Master Sheet" approach. The application is designed to treat a Google Sheet as the primary database, allowing the Admin to maintain full control and data ownership while providing a beautiful, professional UI for users.

---

## 2. Planning & Design Decisions

### A. Professional "Medical-Corporate" Theme
*   **Decision:** Shifted from "Futuristic/Dark" to "Professional/Clean".
*   **Why:** To build trust with doctors. The UI uses Royal Blue (`#1e3a8a`), Clean White, and Slate Grey. It resembles top-tier EMR (Electronic Medical Record) software.
*   **Typography:** 'Inter' font for high readability on all devices.

### B. Role-Based Access Control (RBAC)
*   **Strategy:** The app renders completely different interfaces based on the selected role.
    1.  **Doctor:** E-Commerce style. Simple "Order Form" and visual timeline tracking. **Data Protection:** Can ONLY see orders submitted by "Dr. Smith" (simulated login).
    2.  **Technician:** Industrial/Mobile style. Large buttons, focus on "Todo List". **Data Protection:** Can ONLY see orders assigned to "Tech Mike". **No Camera:** Camera permissions were explicitly removed to maintain simplicity and privacy.
    3.  **Admin:** "God Mode". Dense data tables, inline editing, and AI insights. Full visibility of all data.

### C. The "Master Sheet" Architecture
*   **Current State:** The app uses `services/sheetService.ts` to *simulate* a Google Sheet. It stores data in browser memory/Local Storage for the demo.
*   **Future Integration:** The architecture is planned so that `sheetService.ts` can be swapped with a `fetch()` call to a Google Apps Script Web App without changing the UI code.

---

## 3. File Structure & Responsibilities

### Root Files
*   **`App.tsx`**: The main controller. It handles the state of the `currentRole` (Admin/Doctor/Tech) and determines which Page to render.
*   **`types.ts`**: Defines the data models (`Order`, `UserRole`, `OrderStatus`) to ensure type safety across the app.
*   **`metadata.json`**: Configuration for app permissions (Camera permissions were removed from here).

### Pages (Views)
*   **`pages/AdminDashboard.tsx`**:
    *   **Function:** The control center.
    *   **Features:** KPI Charts (Recharts), Gemini AI Integration (`generateLabInsights`), and a Data Table with *Inline Editing* capabilities.
*   **`pages/DoctorDashboard.tsx`**:
    *   **Function:** The customer portal.
    *   **Features:** A "Prescription Pad" style form for new orders and a visual status timeline.
*   **`pages/TechnicianView.tsx`**:
    *   **Function:** The employee workstation.
    *   **Features:** A simplified list view. One-tap status updates. Filtered to show only assigned work.

### Services (Logic)
*   **`services/sheetService.ts`**:
    *   **Function:** Acts as the "Backend". It currently mocks data but contains the logic for Create, Read, Update, Delete (CRUD) operations.
*   **`services/geminiService.ts`**:
    *   **Function:** Connects to Google's Gemini AI. It takes the raw order list and generates production insights (identifying bottlenecks or rush cases).
*   **`services/mockData.ts`**:
    *   **Function:** Provides initial dummy data so the app looks populated immediately upon load.

### Components (Reusable UI)
*   **`components/Navbar.tsx`**: Top navigation bar. Changes context based on the user role.
*   **`components/StatusBadge.tsx`**: A unified component to display order status colors consistently across all views.
*   **`components/EditableField.tsx`**: A core feature for the Admin. Allows clicking any text in the table to edit it instantly (like Excel).

---

## 4. Next Steps (Deployment)

To go from this Prototype to Production:

1.  **Google Sheet Setup:** Create a Sheet with headers matching `types.ts` (ID, Patient, Status, etc.).
2.  **Apps Script:** Write a small Google Apps Script (`doGet` and `doPost`) to expose the Sheet as a JSON API.
3.  **Connect:** Update `sheetService.ts` to fetch from the Apps Script URL instead of `mockData.ts`.
