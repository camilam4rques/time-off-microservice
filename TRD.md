# 🧾 Technical Requirements Document (TRD)  
## Time-Off Microservice

---

## 1. Overview

This document describes the design and implementation of a **Time-Off Microservice** responsible for managing employee time-off requests while ensuring consistency with an external Human Capital Management (HCM) system.

The service acts as an intermediary between the user-facing application (ReadyOn) and the HCM, which remains the **source of truth** for time-off balances.

> This system prioritizes correctness over availability in approval flows, ensuring that no invalid time-off request is approved even under inconsistent external states.

---

## 2. Problem Statement

The main challenge is maintaining **balance consistency across distributed systems**:

- The HCM system can update balances independently (e.g., annual refresh, bonuses)
- The microservice must validate requests against possibly stale data
- External API failures or inconsistencies must be handled defensively

---

## 3. Goals

- Manage the lifecycle of time-off requests (create, approve, reject)
- Ensure balance integrity between the microservice and HCM
- Handle asynchronous updates from HCM (batch + real-time)
- Provide fast feedback to users
- Be resilient to HCM inconsistencies and failures

---

## 4. Non-Goals

- Payroll calculations
- Complex accrual policies
- Multi-region compliance rules

---

## 5. System Architecture

### Components

- **API Layer (NestJS)**
  - REST endpoints for time-off operations

- **Database (SQLite)**
  - Stores:
    - Time-off balances (cached)
    - Time-off requests

- **HCM Integration Layer**
  - Handles:
    - Real-time validation
    - Batch synchronization
    - Error handling

---

## 6. Data Model

### TimeOffBalance

```ts
{
  employeeId: string;
  locationId: string;
  balance: number;
  lastSyncedAt: Date;
}
