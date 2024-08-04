# Veryfi Splitwise Integration

## Overview

This project integrates Veryfi and Splitwise APIs using Spring Boot. It provides endpoints to process documents with Veryfi and manage groups, friends, categories, and expenses in Splitwise.

## Technologies Used

- Java
- Spring Boot
- Gradle
- Veryfi API
- Splitwise API

## Project Structure

- `src/main/java/com/example/veryfi/controller/DocumentController.java`: Handles document processing with Veryfi.
- `src/main/java/com/example/veryfi/controller/SplitwiseController.java`: Manages Splitwise-related operations.
- `src/main/java/com/example/veryfi/service/SplitwiseClient.java`: Communicates with the Splitwise API.

## Endpoints

### DocumentController

- **POST /api/process-document**
  - Description: Processes a document using Veryfi.
  - Request: Multipart file.
  - Response: Extracted line items from the document.

### SplitwiseController

- **GET /api/splitwise/groups**
  - Description: Retrieves Splitwise groups.
  - Response: List of groups.

- **GET /api/splitwise/friends**
  - Description: Retrieves Splitwise friends.
  - Response: List of friends.

- **GET /api/splitwise/categories**
  - Description: Retrieves Splitwise categories.
  - Response: List of categories.

- **GET /api/splitwise/current-user**
  - Description: Retrieves the current Splitwise user.
  - Response: Current user details.

- **POST /api/splitwise/create-expenses**
  - Description: Creates expenses in Splitwise.
  - Request: List of expenses.
  - Response: Created expenses.

## Configuration

Add the following properties to your `application.properties` file:

```properties
VERYFI_CLIENT_ID=your_veryfi_client_id
VERYFI_CLIENT_SECRET=your_veryfi_client_secret
VERYFI_USERNAME=your_veryfi_username
VERYFI_API_KEY=your_veryfi_api_key
splitwise.api.key=your_splitwise_api_key