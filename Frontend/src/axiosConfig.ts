import axios from "axios";
 
axios.defaults.baseURL =
  process.env.NODE_ENV === "production"
    ? "https://devopsinfoane.site"
    : "http://localhost:5000";
 