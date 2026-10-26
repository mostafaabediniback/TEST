import axios from "axios";

const axiosClient = axios.create({

// baseURL: "http://localhost:8000/api/v1/",
  // baseURL: "http://192.168.1.1:8000/",
baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",

  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default axiosClient;
