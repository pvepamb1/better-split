package com.example.veryfi.controller;

import com.example.veryfi.service.SplitwiseClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/splitwise")
public class SplitwiseController {

    @Autowired
    private SplitwiseClient splitwiseClient;

    @GetMapping("/groups")
    public ResponseEntity<Map<String, Object>> getGroups() {
        return ResponseEntity.ok(splitwiseClient.getGroups());
    }

    @GetMapping("/friends")
    public ResponseEntity<Map<String, Object>> getFriends() {
        return ResponseEntity.ok(splitwiseClient.getFriends());
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(splitwiseClient.getCategories());
    }

    @GetMapping("/current-user")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        return ResponseEntity.ok(splitwiseClient.getCurrentUser());
    }

    @PostMapping("/create-expenses")
    public ResponseEntity<List<Map<String, Object>>> createExpenses(@RequestBody List<Map<String, Object>> expenses) {
        return ResponseEntity.ok(splitwiseClient.createExpenses(expenses));
    }
}
