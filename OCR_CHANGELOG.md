# OCR Changelog

## Modified Files

- `OCR_IMPLEMENTATION_REPORT.md`
- `OCR_CHANGELOG.md`
- `benefitos-backend/debug/corners.jpg` (generated OCR debug artifact)
- `benefitos-backend/debug/cropped.jpg` (generated OCR debug artifact)
- `benefitos-backend/debug/edges.jpg` (generated OCR debug artifact)
- `benefitos-backend/debug/ocr_input.jpg` (generated OCR debug artifact)
- `benefitos-backend/debug/original.jpg` (generated OCR debug artifact)
- `benefitos-backend/debug/warped.jpg` (generated OCR debug artifact)

No OCR source files were modified.

## Added Dependencies

None.

Existing OCR-related dependencies already present:

- `tesseract.js`
- `jimp`
- `multer`
- Expo packages used by the upload/camera path:
  - `expo-camera`
  - `expo-image-picker`
  - `expo-image-manipulator`
  - `expo-file-system`

## Removed Dependencies

None.

## API Changes

None.

Existing OCR-related APIs remain unchanged:

- `POST /api/documents/preprocess`
- `POST /api/documents/verify`

## Database Changes

None.

Document verification still uses the existing document verification workflow and Neo4j update path.

## Frontend Changes

None.

The following OCR-adjacent frontend path was inspected but not modified:

- `src/screens/profile/MyDocumentsScreen.tsx`

The v28-only render tracing in that file was intentionally not migrated.

## Backend Changes

None to OCR source.

The following backend OCR files were inspected and left unchanged because v25 already matches v28:

- `benefitos-backend/src/services/ocr/OCRProvider.js`
- `benefitos-backend/src/services/ocr/TesseractOCRProvider.js`
- `benefitos-backend/src/services/documentIntelligenceService.js`
- `benefitos-backend/src/controllers/workflowController.js`
- `benefitos-backend/src/routes/workflowRoutes.js`

## Verification Notes

Generated mock images were used to verify the current OCR pipeline:

- Aadhaar Card
- PAN Card
- Income Certificate

All three produced readable OCR text and passed document validation.
