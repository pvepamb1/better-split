import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/splitwise/categories`);
  return response.data.categories.flatMap(category => 
    category.subcategories.map(subcategory => ({
      id: subcategory.id,
      name: `${category.name} - ${subcategory.name}`
    }))
  );
};

export const fetchGroups = async () => {
  const response = await axios.get(`${API_BASE_URL}/splitwise/groups`);
  return response.data.groups;
};

export const fetchFriends = async () => {
  const response = await axios.get(`${API_BASE_URL}/splitwise/friends`);
  return response.data.friends;
};

export const fetchCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/splitwise/current-user`);
  return response.data.user;
};

export const processDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/process-document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// In api.js

export const createExpenses = async (expenses) => {
  const formattedExpenses = expenses.map(expense => ({
    cost: expense.cost,
    description: expense.description,
    date: expense.date,
    category_id: expense.category_id,
    split_equally: expense.split_equally,
    group_id: expense.group_id,
    users: expense.users.map((user, index) => ({
      user_id: user.user_id,
      paid_share: user.paid_share,
      owed_share: user.owed_share
    }))
  }));

  const response = await axios.post(`${API_BASE_URL}/splitwise/create-expenses`, formattedExpenses, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

