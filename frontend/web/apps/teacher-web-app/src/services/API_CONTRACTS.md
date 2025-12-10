# API Contracts Documentation

## Attendance API

### Get Enriched Attendance Data

**Endpoint:** `GET /attendance/class/:classId/enriched`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format (e.g., "2025-12-06")

**Description:**
Returns a complete attendance view for a class on a specific date, including all students in the class merged with their attendance records (if they exist).

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "classInfo": {
      "id": "class_uuid",
      "name": "Primary 3A",
      "code": "P3A",
      "period": "Morning",
      "room": "Room 101"
    },
    "date": "2025-12-06",
    "students": [
      {
        "id": "student_uuid",
        "studentId": "STU2025001",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "email": "john.doe@school.com",
        "attendance": {
          "id": "attendance_record_uuid",
          "status": "present",
          "time": "08:30 AM",
          "notes": "Arrived on time",
          "markedBy": "teacher_uuid",
          "markedByName": "Mrs. Smith",
          "markedAt": "2025-12-06T08:30:00Z"
        }
      },
      {
        "id": "student_uuid_2",
        "studentId": "STU2025002",
        "name": "Jane Smith",
        "avatar": null,
        "email": "jane.smith@school.com",
        "attendance": null
      }
    ],
    "statistics": {
      "total": 25,
      "present": 18,
      "absent": 3,
      "late": 2,
      "excused": 1,
      "notMarked": 1,
      "attendanceRate": 88.0
    }
  }
}
```

**Status Values:**
- `"present"` - Student is present
- `"absent"` - Student is absent
- `"late"` - Student arrived late
- `"excused"` - Student has excused absence
- `null` - Attendance not yet marked

**Notes:**
- If a student has no attendance record for the date, `attendance` will be `null`
- All students enrolled in the class are included regardless of attendance status
- Statistics are calculated server-side for accuracy
- `time` is formatted as "HH:MM AM/PM" in the timezone of the school

---

### Mark/Update Attendance

**Endpoint:** `POST /attendance/mark`

**Request Body:**

```json
{
  "classId": "class_uuid",
  "date": "2025-12-06",
  "studentId": "student_uuid",
  "status": "present",
  "notes": "Optional notes",
  "time": "08:30 AM"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "attendance_record_uuid",
    "classId": "class_uuid",
    "studentId": "student_uuid",
    "date": "2025-12-06",
    "status": "present",
    "time": "08:30 AM",
    "notes": "Optional notes",
    "markedBy": "teacher_uuid",
    "markedAt": "2025-12-06T08:30:00Z",
    "createdAt": "2025-12-06T08:30:00Z",
    "updatedAt": "2025-12-06T08:30:00Z"
  }
}
```

---

### Bulk Mark Attendance

**Endpoint:** `POST /attendance/bulk-mark`

**Request Body:**

```json
{
  "classId": "class_uuid",
  "date": "2025-12-06",
  "records": [
    {
      "studentId": "student_uuid_1",
      "status": "present",
      "notes": "Optional",
      "time": "08:30 AM"
    },
    {
      "studentId": "student_uuid_2",
      "status": "absent",
      "notes": "Sick",
      "time": null
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 15,
    "updated": 5,
    "failed": 0,
    "records": [
      {
        "studentId": "student_uuid_1",
        "status": "success",
        "attendanceId": "attendance_record_uuid"
      }
    ]
  }
}
```

---

### Export Attendance Report

**Endpoint:** `GET /attendance/class/:classId/export`

**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `format` (optional): "csv" | "pdf" | "xlsx" (default: "csv")

**Response:**
- Binary file download with appropriate Content-Type header
- Filename in Content-Disposition header

---

### Get Attendance Statistics

**Endpoint:** `GET /attendance/class/:classId/statistics`

**Query Parameters:**
- `startDate` (optional): Start date for range
- `endDate` (optional): End date for range
- If not provided, returns current term statistics

**Response:**

```json
{
  "success": true,
  "data": {
    "classId": "class_uuid",
    "period": {
      "startDate": "2025-09-01",
      "endDate": "2025-12-20"
    },
    "overall": {
      "totalDays": 80,
      "averageAttendanceRate": 92.5,
      "totalPresent": 1850,
      "totalAbsent": 120,
      "totalLate": 80,
      "totalExcused": 50
    },
    "byStudent": [
      {
        "studentId": "student_uuid",
        "studentName": "John Doe",
        "present": 75,
        "absent": 3,
        "late": 2,
        "excused": 0,
        "attendanceRate": 93.75
      }
    ],
    "trends": {
      "byDayOfWeek": {
        "Monday": 95.0,
        "Tuesday": 94.5,
        "Wednesday": 93.0,
        "Thursday": 92.0,
        "Friday": 88.5
      }
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date format",
    "details": {
      "field": "date",
      "expectedFormat": "YYYY-MM-DD"
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found (class, student, etc.)
- `UNAUTHORIZED` - User not authorized for this action
- `DUPLICATE_RECORD` - Attendance already marked
- `DATE_IN_FUTURE` - Cannot mark attendance for future dates
- `CLASS_NOT_ACTIVE` - Class is archived/inactive
