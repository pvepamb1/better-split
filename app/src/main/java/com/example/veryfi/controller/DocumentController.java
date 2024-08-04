package com.example.veryfi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import veryfi.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import veryfi.VeryfiClientFactory;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DocumentController {

    @Value("${VERYFI_CLIENT_ID}")
    private String clientId;

    @Value("${VERYFI_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${VERYFI_USERNAME}")
    private String username;

    @Value("${VERYFI_API_KEY}")
    private String apiKey;

    @PostMapping("/process-document")
    public ResponseEntity<?> processDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            Path filepath = Paths.get(Objects.requireNonNull(file.getOriginalFilename()));
            try (OutputStream os = Files.newOutputStream(filepath)) {
                os.write(file.getBytes());
            }

            Client client = VeryfiClientFactory.createClient(clientId, clientSecret, username, apiKey);
            String jsonResponse = client.processDocument(filepath.toString(), null, true, null);

            //delete the file
            Files.delete(filepath);

            // Parse the JSON response
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode lineItems = rootNode.path("line_items");

            List<Map<String, String>> extractedItems = new ArrayList<>();

            for (JsonNode item : lineItems) {
                Map<String, String> lineItem = new HashMap<>();
                lineItem.put("description", item.path("description").asText());
                lineItem.put("cost", item.path("total").asText());
                extractedItems.add(lineItem);
            }

            return ResponseEntity.ok(extractedItems);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error processing document: " + e.getMessage());
        }
    }
}