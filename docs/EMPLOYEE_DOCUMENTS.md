# Employee Documents API

Complete guide for managing employee documents (RG, CPF, CNH, contracts, certificates, medical exams, etc.).

## Table of Contents
- [Overview](#overview)
- [Document Types](#document-types)
- [File Storage](#file-storage)
- [Endpoints](#endpoints)
  - [List Documents](#list-documents)
  - [Upload Document](#upload-document)
  - [Get Single Document](#get-single-document)
  - [Update Document](#update-document)
  - [Remove Document](#remove-document)
- [Filtering](#filtering)
- [Verification Status](#verification-status)
- [Best Practices](#best-practices)

---

## Overview

The Employee Documents API allows you to manage all types of documents associated with employees. The system stores **document metadata** (URL, filename, size, type, etc.) but does not handle file storage directly - you need to upload files to your storage service (S3, CDN, etc.) first and then register the document metadata.

**Key Features:**
- Support for 14+ document types
- Verification workflow (verified/unverified status)
- Expiry date tracking (for CNH, ASO, etc.)
- Audit trail (tracks who uploaded each document)
- Soft delete capability (active/inactive)
- Comprehensive filtering

---

## Document Types

The system supports the following document types:

```typescript
enum DocumentType {
  RG = 'RG',                                    // Registro Geral (ID Card)
  CPF = 'CPF',                                  // Cadastro de Pessoa Física
  CNH = 'CNH',                                  // Carteira Nacional de Habilitação (Driver's License)
  CTPS = 'CTPS',                                // Carteira de Trabalho
  TITULO_ELEITOR = 'TITULO_ELEITOR',            // Voter Registration
  CERTIFICADO_RESERVISTA = 'CERTIFICADO_RESERVISTA', // Military Service Certificate
  COMPROVANTE_RESIDENCIA = 'COMPROVANTE_RESIDENCIA', // Proof of Residence
  DIPLOMA = 'DIPLOMA',                          // University Diploma
  CERTIFICADO = 'CERTIFICADO',                  // General Certificates
  CONTRATO = 'CONTRATO',                        // Employment Contract
  EXAME_ADMISSIONAL = 'EXAME_ADMISSIONAL',      // Pre-employment Medical Exam
  ASO = 'ASO',                                  // Atestado de Saúde Ocupacional
  ATESTADO = 'ATESTADO',                        // Medical Certificate
  OUTROS = 'OUTROS',                            // Other Documents
}
```

---

## File Storage

**Important:** This API only manages document **metadata**. You must handle file storage separately:

1. **Upload file to your storage** (S3, Azure Blob, Google Cloud Storage, etc.)
2. **Get the file URL** from your storage service
3. **Register the document** using this API with the file URL

Example workflow:
```javascript
// Step 1: Upload file to S3 (example)
const file = req.file;
const s3Url = await uploadToS3(file);

// Step 2: Register document metadata
const document = await fetch('/api/employees/123/documents', {
  method: 'POST',
  body: JSON.stringify({
    documentType: 'CNH',
    name: 'Carteira de Habilitação',
    fileUrl: s3Url,              // URL from step 1
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    expiryDate: '2025-12-31',
  })
});
```

---

## Endpoints

### List Documents

Get all documents for an employee with optional filtering.

**Endpoint:** `GET /employees/:id/documents`

**Permissions:** `employees.read`

**Query Parameters:**
```typescript
{
  documentType?: DocumentType;  // Filter by document type
  verified?: boolean;           // Filter by verification status
  active?: boolean;             // Filter by active status
}
```

**Example Request:**
```http
GET /employees/cm3k1234567890/documents?documentType=CNH&verified=true
Authorization: Bearer {token}
```

**Example Response:**
```json
[
  {
    "id": "cm3k9876543210",
    "employeeId": "cm3k1234567890",
    "companyId": "cm3k0000000001",
    "documentType": "CNH",
    "name": "Carteira de Habilitação - Categoria B",
    "description": "CNH válida até 2025",
    "documentNumber": "12345678900",
    "issueDate": "2020-01-15T00:00:00.000Z",
    "expiryDate": "2025-01-15T00:00:00.000Z",
    "fileUrl": "https://s3.amazonaws.com/my-bucket/documents/cnh-123.pdf",
    "fileName": "cnh_joao_silva.pdf",
    "fileSize": 2458624,
    "mimeType": "application/pdf",
    "verified": true,
    "active": true,
    "notes": "Documento verificado pelo RH em 10/11/2024",
    "uploadedBy": {
      "id": "cm3k5555555555",
      "name": "Maria Santos",
      "email": "maria@example.com"
    },
    "createdAt": "2024-11-01T10:30:00.000Z",
    "updatedAt": "2024-11-10T14:20:00.000Z"
  }
]
```

---

### Upload Document

Upload a new document for an employee.

**Endpoint:** `POST /employees/:id/documents`

**Permissions:** `employees.update`

**Request Body:**
```typescript
{
  documentType: DocumentType;    // Required - Type of document
  name: string;                  // Required - Display name
  description?: string;          // Optional - Additional details
  documentNumber?: string;       // Optional - Document number (e.g., RG number)
  issueDate?: string;           // Optional - ISO date (e.g., "2020-01-15")
  expiryDate?: string;          // Optional - ISO date (e.g., "2025-01-15")
  fileUrl: string;              // Required - URL where file is stored
  fileName: string;             // Required - Original filename
  fileSize: number;             // Required - File size in bytes
  mimeType: string;             // Required - MIME type (e.g., "application/pdf")
  verified?: boolean;           // Optional - Verification status (default: false)
  notes?: string;               // Optional - Additional notes
}
```

**Example Request:**
```http
POST /employees/cm3k1234567890/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentType": "CNH",
  "name": "Carteira de Habilitação - Categoria B",
  "description": "CNH válida até 2025",
  "documentNumber": "12345678900",
  "issueDate": "2020-01-15",
  "expiryDate": "2025-01-15",
  "fileUrl": "https://s3.amazonaws.com/my-bucket/documents/cnh-123.pdf",
  "fileName": "cnh_joao_silva.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "verified": false,
  "notes": "Aguardando verificação do RH"
}
```

**Example Response:**
```json
{
  "id": "cm3k9876543210",
  "employeeId": "cm3k1234567890",
  "companyId": "cm3k0000000001",
  "documentType": "CNH",
  "name": "Carteira de Habilitação - Categoria B",
  "description": "CNH válida até 2025",
  "documentNumber": "12345678900",
  "issueDate": "2020-01-15T00:00:00.000Z",
  "expiryDate": "2025-01-15T00:00:00.000Z",
  "fileUrl": "https://s3.amazonaws.com/my-bucket/documents/cnh-123.pdf",
  "fileName": "cnh_joao_silva.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "verified": false,
  "active": true,
  "notes": "Aguardando verificação do RH",
  "uploadedBy": {
    "id": "cm3k5555555555",
    "name": "Maria Santos",
    "email": "maria@example.com"
  },
  "createdAt": "2024-11-01T10:30:00.000Z",
  "updatedAt": "2024-11-01T10:30:00.000Z"
}
```

---

### Get Single Document

Retrieve a specific document by ID.

**Endpoint:** `GET /employees/:id/documents/:documentId`

**Permissions:** `employees.read`

**Example Request:**
```http
GET /employees/cm3k1234567890/documents/cm3k9876543210
Authorization: Bearer {token}
```

**Example Response:**
```json
{
  "id": "cm3k9876543210",
  "employeeId": "cm3k1234567890",
  "companyId": "cm3k0000000001",
  "documentType": "CNH",
  "name": "Carteira de Habilitação - Categoria B",
  "description": "CNH válida até 2025",
  "documentNumber": "12345678900",
  "issueDate": "2020-01-15T00:00:00.000Z",
  "expiryDate": "2025-01-15T00:00:00.000Z",
  "fileUrl": "https://s3.amazonaws.com/my-bucket/documents/cnh-123.pdf",
  "fileName": "cnh_joao_silva.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "verified": true,
  "active": true,
  "notes": "Documento verificado pelo RH em 10/11/2024",
  "uploadedBy": {
    "id": "cm3k5555555555",
    "name": "Maria Santos",
    "email": "maria@example.com"
  },
  "createdAt": "2024-11-01T10:30:00.000Z",
  "updatedAt": "2024-11-10T14:20:00.000Z"
}
```

---

### Update Document

Update document metadata. **Note:** This does NOT update the file itself - only the metadata.

**Endpoint:** `PATCH /employees/:id/documents/:documentId`

**Permissions:** `employees.update`

**Request Body:** (All fields optional)
```typescript
{
  name?: string;                // Update display name
  description?: string;         // Update description
  documentNumber?: string;      // Update document number
  issueDate?: string;          // Update issue date (ISO format)
  expiryDate?: string;         // Update expiry date (ISO format)
  verified?: boolean;          // Update verification status
  active?: boolean;            // Activate/deactivate document
  notes?: string;              // Update notes
}
```

**Example Request:**
```http
PATCH /employees/cm3k1234567890/documents/cm3k9876543210
Authorization: Bearer {token}
Content-Type: application/json

{
  "verified": true,
  "notes": "Documento verificado pelo RH em 10/11/2024. Aprovado."
}
```

**Example Response:**
```json
{
  "id": "cm3k9876543210",
  "employeeId": "cm3k1234567890",
  "companyId": "cm3k0000000001",
  "documentType": "CNH",
  "name": "Carteira de Habilitação - Categoria B",
  "description": "CNH válida até 2025",
  "documentNumber": "12345678900",
  "issueDate": "2020-01-15T00:00:00.000Z",
  "expiryDate": "2025-01-15T00:00:00.000Z",
  "fileUrl": "https://s3.amazonaws.com/my-bucket/documents/cnh-123.pdf",
  "fileName": "cnh_joao_silva.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "verified": true,
  "active": true,
  "notes": "Documento verificado pelo RH em 10/11/2024. Aprovado.",
  "uploadedBy": {
    "id": "cm3k5555555555",
    "name": "Maria Santos",
    "email": "maria@example.com"
  },
  "createdAt": "2024-11-01T10:30:00.000Z",
  "updatedAt": "2024-11-10T14:25:00.000Z"
}
```

---

### Remove Document

Permanently delete a document. **Warning:** This cannot be undone.

**Endpoint:** `DELETE /employees/:id/documents/:documentId`

**Permissions:** `employees.update`

**Example Request:**
```http
DELETE /employees/cm3k1234567890/documents/cm3k9876543210
Authorization: Bearer {token}
```

**Example Response:**
```json
{
  "message": "Documento removido com sucesso"
}
```

**Note:** For soft delete, use the Update endpoint with `active: false` instead.

---

## Filtering

### Filter by Document Type

Get only specific types of documents:

```http
GET /employees/cm3k1234567890/documents?documentType=CNH
```

Returns only CNH (driver's license) documents.

### Filter by Verification Status

Get only verified documents:

```http
GET /employees/cm3k1234567890/documents?verified=true
```

Get unverified documents:

```http
GET /employees/cm3k1234567890/documents?verified=false
```

### Filter by Active Status

Get only active documents:

```http
GET /employees/cm3k1234567890/documents?active=true
```

Get inactive (soft-deleted) documents:

```http
GET /employees/cm3k1234567890/documents?active=false
```

### Combine Filters

You can combine multiple filters:

```http
GET /employees/cm3k1234567890/documents?documentType=ASO&verified=true&active=true
```

This returns only active, verified ASO (occupational health certificates).

---

## Verification Status

The `verified` field allows you to implement a document verification workflow:

1. **Upload:** Document is uploaded with `verified: false` (default)
2. **Review:** HR team reviews the document
3. **Verify:** HR updates the document with `verified: true` and adds notes

Example workflow:

```javascript
// Step 1: Employee uploads document (unverified)
POST /employees/123/documents
{
  "documentType": "RG",
  "name": "RG - João Silva",
  "fileUrl": "https://...",
  "fileName": "rg.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "verified": false
}

// Step 2: HR reviews and verifies
PATCH /employees/123/documents/456
{
  "verified": true,
  "notes": "Documento verificado em 10/11/2024. Confere com o original."
}

// Step 3: List only verified documents
GET /employees/123/documents?verified=true
```

---

## Best Practices

### 1. Document Expiry Tracking

For documents with expiry dates (CNH, ASO, etc.), set the `expiryDate` field:

```json
{
  "documentType": "CNH",
  "name": "Carteira de Habilitação",
  "expiryDate": "2025-01-15",
  "fileUrl": "https://..."
}
```

You can then build a notification system to alert when documents are about to expire.

### 2. File Naming Convention

Use a consistent naming convention for files:

```
{documentType}_{employeeId}_{timestamp}.{extension}
```

Example:
```
CNH_cm3k1234567890_20241110.pdf
RG_cm3k1234567890_20241110.jpg
```

### 3. File Size Limits

Implement reasonable file size limits:
- Images (RG, CNH, etc.): 5 MB max
- PDFs (contracts, certificates): 10 MB max
- Medical exams (scans): 20 MB max

### 4. Accepted File Types

Restrict file types for security:
- **Images:** `image/jpeg`, `image/png`, `image/jpg`
- **PDFs:** `application/pdf`
- **Office:** `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 5. Security Considerations

- **Access Control:** All endpoints require appropriate permissions
- **Company Isolation:** Documents are filtered by company - users can only see their company's documents
- **Audit Trail:** Every document tracks who uploaded it (`uploadedBy`)
- **File Storage:** Use signed URLs with expiration for file access
- **Virus Scanning:** Scan uploaded files before storing them

### 6. Error Handling

Common error scenarios:

**Employee not found:**
```json
{
  "statusCode": 404,
  "message": "Funcionário não encontrado"
}
```

**Document not found:**
```json
{
  "statusCode": 404,
  "message": "Documento não encontrado"
}
```

**Invalid document type:**
```json
{
  "statusCode": 400,
  "message": "documentType must be a valid enum value"
}
```

**Missing required fields:**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "fileUrl should not be empty"
  ]
}
```

### 7. Complete Usage Example

Here's a complete example of the document lifecycle:

```javascript
// 1. Upload employee's CNH
const uploadResponse = await fetch('/api/employees/cm3k1234567890/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentType: 'CNH',
    name: 'Carteira de Habilitação - João Silva',
    documentNumber: '12345678900',
    issueDate: '2020-01-15',
    expiryDate: '2025-01-15',
    fileUrl: 'https://s3.amazonaws.com/bucket/cnh-123.pdf',
    fileName: 'cnh_joao_silva.pdf',
    fileSize: 2458624,
    mimeType: 'application/pdf',
    notes: 'Aguardando verificação'
  })
});
const document = await uploadResponse.json();

// 2. List all unverified documents for HR review
const unverifiedResponse = await fetch(
  '/api/employees/cm3k1234567890/documents?verified=false',
  {
    headers: { 'Authorization': 'Bearer {token}' }
  }
);
const unverifiedDocs = await unverifiedResponse.json();

// 3. HR verifies the document
const verifyResponse = await fetch(
  `/api/employees/cm3k1234567890/documents/${document.id}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer {token}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      verified: true,
      notes: 'Documento verificado em 10/11/2024. Confere com o original.'
    })
  }
);

// 4. Check for documents expiring soon (client-side logic)
const allDocsResponse = await fetch(
  '/api/employees/cm3k1234567890/documents',
  {
    headers: { 'Authorization': 'Bearer {token}' }
  }
);
const allDocs = await allDocsResponse.json();

const expiringDocs = allDocs.filter(doc => {
  if (!doc.expiryDate) return false;
  const daysUntilExpiry = 
    (new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30; // Expiring in 30 days
});

console.log('Documents expiring soon:', expiringDocs);

// 5. Soft delete old document when uploading a new version
await fetch(
  `/api/employees/cm3k1234567890/documents/${oldDocumentId}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer {token}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      active: false,
      notes: 'Substituído por nova versão em 10/11/2024'
    })
  }
);
```

---

## Summary

The Employee Documents API provides a comprehensive solution for managing all types of employee documents. Key points:

- **14+ Document Types** - Support for all common Brazilian documents
- **Metadata Only** - Store document info, not the files themselves
- **Verification Workflow** - Track which documents have been verified
- **Expiry Tracking** - Monitor documents that expire (CNH, ASO, etc.)
- **Audit Trail** - Know who uploaded each document
- **Flexible Filtering** - Filter by type, verification status, and active status
- **Security** - Proper permissions and company isolation

For questions or issues, refer to the main API documentation or contact the development team.
