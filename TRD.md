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

### 7.1 Create Request  
**POST /time-off**

- Validates against local balance  
- Calls HCM for validation (defensive check)  
- Creates request as `PENDING`  

---

### 7.2 Approve Request  
**POST /time-off/:id/approve**

- Re-validates balance with HCM  
- Deducts balance if valid  
- Marks as `APPROVED`  

---

### 7.3 Reject Request  
**POST /time-off/:id/reject**

- Marks as `REJECTED`  

---

### 7.4 Get Balance  
**GET /balances/:employeeId**

- Returns cached balance  

---

## 8. HCM Integration Strategy

### 8.1 Real-time API

Used for:
- Validating requests  
- Updating balances  

### 8.2 Batch API

Used for:
- Periodic reconciliation  
- Overwriting local cache  

---

## 9. Consistency Strategy

This system uses an **eventual consistency model**:

- Local cache provides fast responses  
- HCM is always treated as the final authority  
- Reconciliation jobs correct inconsistencies  

---

## 10. Key Challenges & Solutions

### 10.1 Stale Balance Problem

**Challenge:**  
Local balance may be outdated  

**Solution:**  
- Always validate with HCM before approval  
- Use batch sync to reconcile  

---

### 10.2 Concurrent Requests

**Challenge:**  
Multiple requests may exceed balance  

**Solution:**  
- Re-check balance at approval time  
- Use database transactions (if supported)  

---

### 10.3 HCM Failures

**Challenge:**  
HCM may be unavailable or inconsistent  

**Solution:**  
- Fail safely (reject or retry)  
- Log errors  
- Consider retry strategy (future improvement)  

---

### 10.4 External Updates

**Challenge:**  
Balance changes outside the system (e.g., anniversary bonus)  

**Solution:**  
- Batch sync endpoint updates local cache  
- Use `lastSyncedAt` to track freshness  

---

## 11. Security Considerations

- Validate all input data  
- Prevent negative balances  
- Avoid trusting client-side validation  
- Authentication and authorization can be added in future iterations  

---

## 12. Testing Strategy

### 12.1 Unit Tests

- Business logic validation  
- Edge cases (negative balance, invalid requests)  

---

### 12.2 Integration Tests

- API + database interaction  
- HCM mock interaction  

---

### 12.3 Mock HCM Server

Simulates:
- Balance validation  
- Errors  
- External updates  

---

### 12.4 Key Test Scenarios

- Request within balance → success  
- Request exceeding balance → failure  
- Concurrent requests → consistency maintained  
- HCM returns error → handled gracefully  
- Batch sync updates balance correctly  

---

## 13. Trade-offs & Alternatives

### 13.1 Fully Synchronous Validation (Chosen)

- ✅ Strong consistency at approval  
- ❌ Slower response time  

---

### 13.2 Optimistic Updates (Not Chosen)

- ✅ Fast user experience  
- ❌ Risk of inconsistency  

---

### 13.3 Event-driven Architecture (Future)

- ✅ Scalable and decoupled  
- ❌ More complex  

---

## 14. Future Improvements

- Add message queue (Kafka/RabbitMQ)  
- Implement retry mechanisms  
- Add authentication & authorization  
- Support accrual policies  
- Introduce caching layer (Redis)  
- Observability (logs, metrics)  

---

## 15. Conclusion

This solution balances **performance, consistency, and resilience** by:

- Using local caching for speed  
- Deferring final validation to HCM  
- Implementing reconciliation mechanisms  
- Designing defensively against failures  
