package com.example.veryfi.controller;

import com.example.veryfi.service.ExpenseCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseCalculationService expenseCalculationService;

    @PostMapping("/create")
    public ResponseEntity<List<Map<String, Object>>> createExpenses(@RequestBody List<Map<String, Object>> requestData) {
        List<Map<String, Object>> response = expenseCalculationService.processAndCreateExpenses(requestData);
        return ResponseEntity.ok(response);
    }
}