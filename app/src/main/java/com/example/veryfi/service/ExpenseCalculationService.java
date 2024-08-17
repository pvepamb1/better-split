package com.example.veryfi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseCalculationService {

    @Autowired
    private SplitwiseClient splitwiseClient;

    public List<Map<String, Object>> processAndCreateExpenses(List<Map<String, Object>> lineItems) {
        List<Map<String, Object>> processedExpenses = new ArrayList<>();

        for (Map<String, Object> item : lineItems) {
            List<Map<String, Object>> users = (List<Map<String, Object>>) item.get("users");

            // Skip items without selected members
            if (users == null || users.isEmpty()) {
                System.out.println("Skipping line item with no selected members: " + item);
                continue;
            }

            // Extract details from each line item
            String description = (String) item.get("description");
            String cost = (String) item.get("cost");
            String date = (String) item.get("date");
            Integer categoryId = (Integer) item.get("category_id");
            Integer payer = (Integer) item.get("payer");
            Integer groupId = (Integer) item.get("group_id");

            // Calculate shares and prepare users list
            List<Map<String, Object>> selectedMembers = getSelectedMembers(users);
            double totalCost = Double.parseDouble(cost);
            boolean payerInvolved = isPayerInvolved(selectedMembers, payer);
            double perPersonShare = calculatePerPersonShare(totalCost, selectedMembers.size(), payerInvolved);
            List<Double> owedShares = calculateOwedShares(selectedMembers, payer, perPersonShare, payerInvolved);
            owedShares = distributeRemainderCents(owedShares, totalCost);

            List<Map<String, Object>> preparedUsers = prepareUsersList(selectedMembers, payer, cost, owedShares);

            // Ensure the payer is included in the users list
            if (!payerInvolved) {
                Map<String, Object> payerUser = new HashMap<>();
                payerUser.put("user_id", payer);
                payerUser.put("paid_share", cost); // The payer paid the full cost
                payerUser.put("owed_share", "0.00"); // The payer owes nothing
                preparedUsers.add(payerUser);
            }

            // Create expense map
            Map<String, Object> expense = new HashMap<>();
            expense.put("cost", cost);
            expense.put("description", toTitleCase(description));
            expense.put("date", date);
            expense.put("category_id", categoryId);
            expense.put("split_equally", false);
            expense.put("group_id", groupId);
            expense.put("users", preparedUsers);

            processedExpenses.add(expense);
        }

        return splitwiseClient.createExpenses(processedExpenses);
    }

    private List<Map<String, Object>> getSelectedMembers(List<Map<String, Object>> users) {
        // Assuming users list is already filtered for selected members
        return users;
    }

    private boolean isPayerInvolved(List<Map<String, Object>> selectedMembers, Integer payer) {
        return selectedMembers.stream().anyMatch(member -> member.get("user_id").equals(payer));
    }

    private double calculatePerPersonShare(double totalCost, int numberOfMembers, boolean payerInvolved) {
        if (!payerInvolved && numberOfMembers == 1) {
            return totalCost;
        }
        return roundToTwoDecimalPlaces(totalCost / (payerInvolved ? numberOfMembers : numberOfMembers - 1));
    }

    private List<Double> calculateOwedShares(List<Map<String, Object>> selectedMembers, Integer payer, double perPersonShare, boolean payerInvolved) {
        List<Double> owedShares = new ArrayList<>();
        for (Map<String, Object> member : selectedMembers) {
            if (payerInvolved || !member.get("user_id").equals(payer)) {
                owedShares.add(roundToTwoDecimalPlaces(perPersonShare));
            } else {
                owedShares.add(0.0);
            }
        }
        return owedShares;
    }

    private List<Double> distributeRemainderCents(List<Double> shares, double total) {
        double totalShares = shares.stream().mapToDouble(Double::doubleValue).sum();
        double remainder = roundToTwoDecimalPlaces(total - totalShares);

        if (remainder == 0) {
            return shares;
        }

        double step = remainder > 0 ? 0.01 : -0.01;
        for (int i = 0; i < Math.abs(remainder) * 100; i++) {
            shares.set(i % shares.size(), roundToTwoDecimalPlaces(shares.get(i % shares.size()) + step));
        }

        return shares;
    }

    private List<Map<String, Object>> prepareUsersList(List<Map<String, Object>> selectedMembers, Integer payer, String cost, List<Double> owedShares) {
        List<Map<String, Object>> users = new ArrayList<>();
        for (int i = 0; i < selectedMembers.size(); i++) {
            Map<String, Object> member = selectedMembers.get(i);
            Map<String, Object> user = new HashMap<>();
            user.put("user_id", member.get("user_id"));
            user.put("paid_share", member.get("user_id").equals(payer) ? cost : "0.00");
            user.put("owed_share", String.valueOf(roundToTwoDecimalPlaces(owedShares.get(i))));
            users.add(user);
        }
        return users;
    }

    private double roundToTwoDecimalPlaces(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String toTitleCase(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}