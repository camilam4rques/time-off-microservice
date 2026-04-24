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
```

## 7. API Design

The API follows a RESTful approach using NestJS controllers.

### 7.1 Create Time-Off Request  
**POST /time-off**

Creates a new time-off request.

Flow:
- Validates input data
- Checks local balance
- Stores request as `PENDING`

⚠️ Note: Current implementation relies primarily on local validation.

---

### 7.2 Approve Time-Off Request  
**PATCH /time-off/:id/approve**

- Updates request status to `APPROVED`
- Deducts balance locally

⚠️ Limitation:
- No real-time validation with HCM at approval time

---

### 7.3 Reject Time-Off Request  
**PATCH /time-off/:id/reject**

- Updates request status to `REJECTED`

---

### 7.4 Get Balance  
**GET /balances/:employeeId**

- Returns stored balance from database

---

## 8. HCM Integration Strategy

### Current Implementation

- A mock or simplified HCM interaction is used
- Balance validation is mostly handled locally

### Limitations

- No external API client abstraction
- No retry or failure handling strategy

---

## 9. Consistency Strategy

The system currently follows a **local consistency model**:

- Balances are stored and validated locally
- No guaranteed synchronization with external systems

⚠️ This differs from ideal eventual consistency with HCM

---

## 10. Key Challenges & Current Handling

### 10.1 Stale Balance Problem

**Current State:**
- Balance is assumed to be accurate locally

**Gap:**
- No reconciliation with external system

---

### 10.2 Concurrent Requests

**Current State:**
- No explicit concurrency control

**Risk:**
- Multiple approvals may exceed balance

---

### 10.3 External System Failures

**Current State:**
- Not implemented

---

### 10.4 External Updates

**Current State:**
- Not handled (no batch sync)

---

## 11. Security Considerations

Implemented:
- Basic validation via DTOs

Missing:
- Authentication / authorization
- Rate limiting
- Input sanitization hardening

---

## 12. Testing Strategy

### Implemented

- Basic unit tests (if applicable in repo)

### Gaps

- No HCM mock integration layer
- No concurrency tests
- Limited edge case coverage

---

## 13. Trade-offs & Decisions

### Chosen Approach

- Simpler architecture prioritizing clarity and delivery speed
- Local validation instead of distributed consistency

### Trade-offs

- ✅ Easier to implement and test
- ❌ Not production-ready for distributed environments

---

## 14. Future Improvements

- Introduce HCM client layer (separation of concerns)
- Add real-time validation before approval
- Implement batch synchronization endpoint
- Add transactional safety (locks or DB transactions)
- Improve test coverage (integration + edge cases)
- Add retry and fallback mechanisms

---

## 15. Conclusion

This implementation demonstrates a clear and functional baseline for a time-off service:

- Clean API design with NestJS
- Proper domain separation (requests and balances)
- Basic lifecycle management

However, it currently lacks:

- External system integration robustness
- Strong consistency guarantees
- Defensive validation strategies

These improvements would be necessary for a production-grade distributed system.
## 15. Conclusion

This solution balances **performance, consistency, and resilience** by:

- Using local caching for speed  
- Deferring final validation to HCM  
- Implementing reconciliation mechanisms  
- Designing defensively against failures  


This implementation prioritizes simplicity and clarity, while outlining how a production-ready system would handle distributed consistency
