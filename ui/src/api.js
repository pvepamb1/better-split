import axios from 'axios';

const API_BASE_URL = '/api';

// axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

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

export const createExpensesOnBackend = async (requestData) => {
  const response = await axios.post(`${API_BASE_URL}/splitwise/create-expenses`, requestData);
  return response.data;
};