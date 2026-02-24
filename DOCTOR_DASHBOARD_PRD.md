# PRD: Doctor Dashboard - RS Contoh Sehat

## 1. Overview
The Doctor Dashboard is a protected workspace for doctors to manage their daily appointments, monitor real-time queues, and track performance statistics. It aims to streamline the consultation process and improve patient flow.

## 2. User Stories
- As a **Doctor**, I want to see a list of today's appointments so that I can plan my day.
- As a **Doctor**, I want to see who has checked in so that I know who is waiting in the queue.
- As a **Doctor**, I want to start a consultation (status: `IN_PROGRESS`) so that the system knows I am currently seeing a patient.
- As a **Doctor**, I want to mark a consultation as completed so that I can call the next patient.
- As a **Doctor**, I want to see quick stats (Total Today, Checked-in, Completed, No-show) to monitor my workload.
- As a **Doctor**, I want to search for patients by name or NIK to access their appointment details quickly.
- As a **Doctor**, I want a mini calendar view to see my weekly schedule at a glance.

## 3. Key Features & Requirements

### 3.1. Today's Appointments
- **Filter**: Filtered by logged-in doctor ID and current date.
- **Display**: Table or Cards list.
- **Data**: Time, Patient Name (masked), Patient RM/NIK (masked), Type (BPJS/Umum), Status Badge, Notes (keluhan).
- **Actions**: "Start Consultation", "Mark Complete", "Mark No-Show", "Cancel".

### 3.2. Current Queue
- **Filter**: Status = `CHECKED_IN` AND not yet `COMPLETED` or `IN_PROGRESS`.
- **Sort**: Sequential by check-in time (queue number).
- **Actions**: "Call Next Patient" (Update status of the first patient in queue to `IN_PROGRESS`).

### 3.3. Quick Stats (shadcn/ui Cards)
- **Total Today**: Total appointments booked for today.
- **Checked-in**: Patients who have checked in but not completed.
- **Completed**: Patients whose consultation is finished.
- **No-show**: Patients who missed their slot (handled by cron or manual).
- **BPJS vs Umum**: Count of each appointment type.
- **Occupancy**: Percentage of booked slots vs total available slots.

### 3.4. Mini Calendar
- **View**: Week/Day view using FullCalendar.
- **Highlight**: Current day and booked slots colored by status.

### 3.5. Notifications
- **Trigger**: New check-in, No-show detection.
- **UI**: Dropdown bell in the header.

### 3.6. Quick Patient Search
- **Function**: Real-time search by patient name or NIK.
- **Result**: Filtered list of appointments.

## 4. Technical Specifications

### 4.1. Database (Prisma)
Update `AppointmentStatus` enum and `Appointment` model:
- Add `IN_PROGRESS` to `AppointmentStatus`.
- Add `notes` (keluhan) field to `Appointment`.
- Ensure `checkInLogs` is used for queue management.

### 4.2. API Endpoints
- `GET /api/doctor/dashboard-data`: Returns stats and today's appointments.
- `PATCH /api/doctor/appointments/[id]/status`: Updates appointment status.
- `GET /api/doctor/search-patients?q=...`: Search for appointments.

### 4.3. State Management & Real-time
- Use polling (every 30s) or Server Actions with `revalidatePath` for real-time updates.

## 5. UI/UX Design (shadcn/ui)
- **Layout**: 
  - Sidebar: Navigation.
  - Header: Search, Notifications, Profile.
  - Main: Stats Grid (top), Today's Appointments & Queue (split view or tabs).
- **Responsiveness**: Mobile stacked, Desktop grid.
- **Language**: Bahasa Indonesia default.
- **PDP Compliance**: Mask sensitive patient data (e.g., "Budi S***" for "Budi Santoso").

## 6. Success Metrics
- Average time spent per consultation tracked.
- Reduced patient waiting time in the queue.
- Accurate recording of no-shows and completed appointments.
