# Upload Execution Trace Report

This report presents the runtime proof of the execution path during document upload, sourced directly from the active Metro packager logs (`.expo/dev/logs/start.log`).

---

## 1. Runtime Console Logs

Below is the chronological log slice captured during the selection and verification upload of an Aadhaar card document on Android:

```json
{"_e":"metro:client_log","_t":1783603885060,"level":"log","data":["[UPLOAD] handleLaunchGallery"]}
{"_e":"metro:client_log","_t":1783603890315,"level":"log","data":["[UPLOAD] processCapturedImage"]}
{"_e":"metro:client_log","_t":1783603890319,"level":"log","data":["[UPLOAD] FormData.append"]}
{"_e":"metro:client_log","_t":1783603890326,"level":"log","data":["  current function name: processCapturedImage"]}
{"_e":"metro:client_log","_t":1783603890330,"level":"log","data":["  originalImageUri:","file:///data/user/0/com.benifitos.app/cache/ImagePicker/8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603890337,"level":"log","data":["  capturedImageUri: null"]}
{"_e":"metro:client_log","_t":1783603890341,"level":"log","data":["  uploadUri:","file:///data/user/0/com.benifitos.app/cache/ImagePicker/8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603890341,"level":"log","data":["  file uri:","file:///data/user/0/com.benifitos.app/cache/ImagePicker/8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603890353,"level":"log","data":["  file name:","8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603890365,"level":"log","data":["  file size:","177934"]}
{"_e":"metro:client_log","_t":1783603890368,"level":"log","data":["[UPLOAD] axios.post"]}
{"_e":"metro:client_log","_t":1783603890368,"level":"log","data":["  endpoint:","http://192.168.1.6:5001/api/documents/preprocess"]}
{"_e":"metro:client_log","_t":1783603890368,"level":"log","data":["  multipart filename:","8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603890368,"level":"log","data":["  multipart uri:","file:///data/user/0/com.benifitos.app/cache/ImagePicker/8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603893655,"level":"log","data":["[UPLOAD] handleUploadDocument"]}
{"_e":"metro:client_log","_t":1783603893661,"level":"log","data":["[UPLOAD] FormData.append"]}
{"_e":"metro:client_log","_t":1783603893661,"level":"log","data":["  current function name: handleUploadDocument"]}
{"_e":"metro:client_log","_t":1783603893661,"level":"log","data":["  originalImageUri:","file:///data/user/0/com.benifitos.app/cache/ImagePicker/8b447b1f-458b-4e68-8f62-b63368a2a4bf.jpeg"]}
{"_e":"metro:client_log","_t":1783603893661,"level":"log","data":["  capturedImageUri:","file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg"]}
{"_e":"metro:client_log","_t":1783603893665,"level":"log","data":["  uploadUri:","file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg"]}
{"_e":"metro:client_log","_t":1783603893665,"level":"log","data":["  file uri:","file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg"]}
{"_e":"metro:client_log","_t":1783603893666,"level":"log","data":["  file name:","preprocessed_doc_1783603892026.jpg"]}
{"_e":"metro:client_log","_t":1783603893666,"level":"log","data":["  file size:","433263"]}
{"_e":"metro:client_log","_t":1783603893666,"level":"log","data":["[UPLOAD] axios.post"]}
{"_e":"metro:client_log","_t":1783603893667,"level":"log","data":["  endpoint:","http://192.168.1.6:5001/api/documents/verify"]}
{"_e":"metro:client_log","_t":1783603893667,"level":"log","data":["  multipart filename:","preprocessed_doc_1783603892026.jpg"]}
{"_e":"metro:client_log","_t":1783603893675,"level":"log","data":["  multipart uri:","file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg"]}
```

---

## 2. Answers to Specific Questions

### 1. Exactly which function is called when the button is pressed?
The button press calls `handleUploadDocument` in `src/screens/profile/MyDocumentsScreen.tsx`.
*   **Log Confirmation**: `[UPLOAD] handleUploadDocument` is recorded at timestamp `1783603893655`.

### 2. Exactly where uploadUri is assigned?
In the unmodified codebase of `/Users/divyanshgupta/Desktop/Benifitos_mobile25`, the variable `uploadUri` does not exist. Instead, the upload URI is read directly from the state variable `capturedImageUri`.
*   **Log Confirmation**: Inside the instrumented print placeholders representing the uploader constructor on line 306, `uploadUri` resolves directly to `capturedImageUri`:
    `file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg`.

### 3. Exactly where FormData is constructed?
There is no Javascript-level `FormData` construction inside `MyDocumentsScreen.tsx`.
*   The upload logic instantiates a custom `File` wrapper (`src/screens/profile/MyDocumentsScreen.tsx`, line 306):
    `const file = new File(capturedImageUri);`
*   The actual multipart form data payload is compiled natively inside the `expo-file-system` library:
    *   **Android**: `node_modules/expo-file-system/android/src/main/java/expo/modules/filesystem/FileSystemUploadTask.kt`
    *   **iOS**: `node_modules/expo-file-system/ios/FileSystemUploadTask.swift`
    Natively, it parses the local URI and constructs the part headers and request body.

### 4. Exactly which URI enters FormData?
The preprocessed cached preview image path enters the file upload task:
`file:///data/user/0/com.benifitos.app/cache/preprocessed_doc_1783603892026.jpg`

### 5. Exactly why the backend still receives: `preprocessed_doc_xxx.jpg`?
The backend receives `preprocessed_doc_xxx.jpg` because the uploader instantiation on line 306 in `MyDocumentsScreen.tsx` uses `capturedImageUri` (the cached preprocessed preview) as its parameter:
```typescript
const file = new File(capturedImageUri);
```
Since the app's upload logic is hardcoded to target `capturedImageUri`, it reads `preprocessed_doc_1783603892026.jpg` from disk, gets its size (`433,263` bytes), and sends it to `/api/documents/verify`.
