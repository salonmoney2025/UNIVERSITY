# EBKUST Portal Implementation Plan

**Date:** March 15, 2026
**Source:** EBKUST Portal Screenshots Analysis
**Goal:** Replicate EBKUST design and features while maintaining Next.js/TypeScript stack

---

## 🎨 Design Changes

### Color Scheme Update:
- **Current:** Indigo theme (#4F46E5)
- **New:** Teal/Turquoise theme (#14A38B)
  - Sidebar Background: #14A38B (teal)
  - Welcome Section: #14A38B (bright teal)
  - Header: #3A4D5C (dark blue-gray)
  - Active Menu: #2C3E50 (dark gray)
  - Submenu BG: rgba(0,0,0,0.2) (darker teal)

### Layout Changes:
1. Add "Welcome FWSHERIFF" section at top of sidebar
2. Implement expandable submenu system (chevron indicators)
3. Update header branding to "MC Portal" style
4. Add hamburger menu icon in header

---

## 📋 Complete Navigation Structure (27 Modules)

### Current Modules (Keep & Enhance):
1. ✅ Dashboard
2. ✅ Students → Rename to "STUDENT MANAGEMENT"
3. ✅ Examinations → Rename to "EXAMINATIONS"
4. ✅ Finance (keep as is)
5. ✅ HR Management → Rename to "HR MANAGEMENT"
6. ✅ Applications → Rename to "ONLINE APPLICATION"
7. ✅ Communications (keep as is)
8. ✅ Courses → Move under "SYSTEM SETTINGS" submenu
9. ✅ Library → Rename to "LIBRARY MANAGEMENT"
10. ✅ Calendar (keep as is)
11. ✅ Database (keep as is)
12. ✅ Settings → Rename to "SETTINGS"

### New Modules to Create:

#### 13. SYSTEM SETTINGS (Expandable)
**Submenus:**
- Add Campus
- Manage Campuses
- Manage Signatures
- Manage Faculties
- Manage Departments
- Add Course
- Course Rollover
- SMS Templates

#### 14. SYSTEM ADMINS (Expandable)
**Submenus:**
- Add User
- Manage Users
- Reset User Password

#### 15. BANKS (Expandable)
**Submenus:**
- Manage Bank Names
- Add Bank
- Manage Banks

#### 16. RECEIPT (Expandable)
**Submenus:**
- Receipt Reports
- Generate Receipt
- View Receipts

#### 17. APPLICATION PINS (New Page)
- Generate PINs
- Manage PINs
- PIN Reports

#### 18. HELP DESK (New Page)
- Tickets
- Knowledge Base
- FAQ Management

#### 19. LETTERS (New Page)
- Generate Letters
- Letter Templates
- Sent Letters

#### 20. BACK OFFICE (Expandable)
**Submenus:**
- Office Management
- Document Processing
- Administrative Tasks

#### 21. STUDENT ID CARDS (New Page)
- Generate ID Cards
- Print Queue
- Card Templates

#### 22. STAFF ID CARDS (New Page)
- Generate Staff IDs
- Print Queue
- Card Templates

#### 23. NOTIFICATIONS (Enhanced)
- System Notifications
- Email Notifications
- SMS Notifications
- Push Notifications

#### 24. STAFF BENEFIT (New Page)
- Benefits Management
- Claims Processing
- Benefits Reports

#### 25. MANAGE REVERSALS (New Page)
- Payment Reversals
- Transaction Reversals
- Reversal Reports

#### 26. FILES MANAGEMENT (New Page)
- Document Upload
- File Organization
- Document Search

#### 27. MATRICULATION (New Page)
- Matriculation List
- Generate Matric Numbers
- Matriculation Ceremony

#### 28. GRADUATION (New Page)
- Graduation List
- Ceremony Management
- Certificate Generation

#### 29. BATCH TRANSFER (New Page)
- Student Transfers
- Batch Operations
- Transfer Reports

#### 30. SU ELECTIONS (New Page)
- Election Management
- Voting System
- Results Management

#### 31. RECONCILIATION (New Page)
- Financial Reconciliation
- Account Matching
- Reconciliation Reports

#### 32. REPORTS (Expandable)
**Submenus:**
- Student Reports
- Financial Reports
- HR Reports
- System Reports

---

## 👤 Enhanced Profile Page

Based on EBKUST profile screenshot, add these fields:

**Personal Information:**
- Employee ID (read-only)
- First Name *
- Last Name *
- Email Address *
- Mobile Number *
- Date of Birth (with date picker)
- Gender (dropdown: Male, Female)
- Relationship Status (dropdown: Single, Married, etc.)
- Address

**Professional Information:**
- College Name * (dropdown)
- Faculty Name * (dropdown)
- Department Name * (dropdown)
- Role * (dropdown: Administrative Staff, Faculty, etc.)
- Date of Employment (with date picker)
- Qualification
- Status (Active/Inactive)

**System:**
- Choose School Logo (file upload)
- Update Profile button (teal color)
- Refresh button
- Record count indicator

---

## 🔧 Implementation Priority

### Phase 1: Core Design Update (HIGH PRIORITY) ✅ COMPLETED
- [x] Update color scheme to teal/turquoise
- [x] Add Welcome section to sidebar
- [x] Implement expandable submenu system
- [x] Update header styling with MC Portal branding
- [x] Update all components to use teal theme

### Phase 2: System Settings Module (HIGH PRIORITY) ✅ PARTIALLY COMPLETED
- [x] Create Add Campus page
- [x] Create Manage Campuses page
- [x] Create Manage Signatures page
- [x] Create Manage Faculties page
- [x] Create Manage Departments page
- [ ] Create Add Course page
- [ ] Create Course Rollover page
- [ ] Create SMS Templates page

### Phase 3: Administrative Modules (MEDIUM PRIORITY)
- [ ] System Admins module
- [ ] Banks module
- [ ] Receipt module
- [ ] Application Pins

### Phase 4: Student Services (MEDIUM PRIORITY)
- [ ] Help Desk system
- [ ] Letters generation
- [ ] Student ID Cards
- [ ] Staff ID Cards

### Phase 5: Office Management (MEDIUM PRIORITY)
- [ ] Back Office module
- [ ] Files Management
- [ ] Notifications enhancement

### Phase 6: Academic Operations (MEDIUM PRIORITY)
- [ ] Matriculation module
- [ ] Graduation module
- [ ] Batch Transfer
- [ ] SU Elections

### Phase 7: Financial & Reports (MEDIUM PRIORITY)
- [ ] Staff Benefit
- [ ] Manage Reversals
- [ ] Reconciliation
- [ ] Reports module

### Phase 8: Profile Enhancement (LOW PRIORITY)
- [ ] Update profile page with all fields
- [ ] Add logo upload functionality
- [ ] Add form validation

---

## 📊 Expected Outcomes

**Total Pages:** 14 → 40+ pages
**Navigation Modules:** 12 → 32 modules
**Submenus:** None → 50+ submenu items
**Color Theme:** Indigo → Teal/Turquoise
**Design Style:** Modern minimal → EBKUST portal style

---

## 🚀 Technical Implementation

**Maintain Current Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (update colors in config)
- Lucide React Icons
- Zustand for state management

**New Features Needed:**
- Submenu collapse/expand state management
- Custom teal color palette in Tailwind
- More complex navigation structure
- Enhanced profile form with validation

---

**Status:** Ready to Implement
**Estimated Development Time:** This is a MAJOR redesign
**Recommendation:** Implement in phases starting with Phase 1
