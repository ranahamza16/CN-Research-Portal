# Postman API Testing Collection

This directory contains the exported Postman collection for the **University Research Opportunity Portal REST API**:
- File: [`research_portal.postman_collection.json`](./research_portal.postman_collection.json)

## How to Import into Postman
1. Open **Postman**.
2. Click **Import** in the top-left corner.
3. Drag and drop or browse to select `research_portal.postman_collection.json`.
4. Ensure your server is running on `http://localhost:5000`.
5. Select the collection **University Research Opportunity Portal API** and click **Run Collection**.

## Included Test Scenarios (Matches Assignment Specification)
1. **Health Check (`GET /api/health`)** - Confirms API server availability.
2. **Create Opportunity #1 (`POST /api/opportunities`)** - Creates initial research opportunity (201 Created).
3. **Create Opportunity #2 (`POST /api/opportunities`)** - Creates second research opportunity (201 Created).
4. **Create Opportunity #3 (`POST /api/opportunities`)** - Creates third opportunity used for update/delete lifecycle tests (201 Created).
5. **Retrieve All Opportunities (`GET /api/opportunities`)** - Retrieves all stored records (200 OK).
6. **Retrieve One Opportunity by ID (`GET /api/opportunities/:id`)** - Fetches complete details of single record (200 OK).
7. **Update Existing Opportunity (`PUT /api/opportunities/:id`)** - Updates positions, skills, deadline (200 OK).
8. **Change Status to Closed (`PUT /api/opportunities/:id`)** - Tests status transition from `Open` to `Closed` (200 OK).
9. **Delete Opportunity (`DELETE /api/opportunities/:id`)** - Removes opportunity from database (200 OK).
10. **Request Deleted Opportunity (`GET /api/opportunities/:id`)** - Verifies proper `404 Not Found` response.
11. **Validation Failure (`POST /api/opportunities`)** - Sends missing fields to demonstrate `400 Bad Request` input validation.
