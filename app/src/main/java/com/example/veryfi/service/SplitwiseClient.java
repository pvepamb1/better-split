package com.example.veryfi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SplitwiseClient {

    @Value("${splitwise.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl = "https://secure.splitwise.com/api/v3.0";

    public Map<String, Object> getGroups() {
        String url = baseUrl + "/get_groups";
        return makeGetRequest(url);
    }

    public Map<String, Object> getFriends() {
        String url = baseUrl + "/get_friends";
        return makeGetRequest(url);
    }

    public Map<String, Object> getCategories() {
        String url = baseUrl + "/get_categories";
        return makeGetRequest(url);
    }

    public List<Map<String, Object>> createExpenses(List<Map<String, Object>> expenses) {
        String url = baseUrl + "/create_expense";

        List<Map<String, Object>> formattedExpenses = expenses.stream().map(expense -> {
            Map<String, Object> formattedExpense = new HashMap<>(expense);
            List<Map<String, Object>> users = (List<Map<String, Object>>) expense.get("users");
            for (int i = 0; i < users.size(); i++) {
                Map<String, Object> user = users.get(i);
                formattedExpense.put("users__" + i + "__user_id", user.get("user_id"));
                formattedExpense.put("users__" + i + "__paid_share", user.get("paid_share"));
                formattedExpense.put("users__" + i + "__owed_share", user.get("owed_share"));
            }
            formattedExpense.remove("users");
            return formattedExpense;
        }).toList();

        // Now send formattedExpenses to Splitwise API
        return formattedExpenses.stream()
                .map(expense -> makePostRequest(url, expense))
                .toList();
    }

    public Map<String, Object> getCurrentUser() {
        String url = baseUrl + "/get_current_user";
        return makeGetRequest(url);
    }

    private Map<String, Object> makeGetRequest(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }

    private Map<String, Object> makePostRequest(String url, Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        return response.getBody();
    }
}
