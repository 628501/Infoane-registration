import axios from "axios";

axios.defaults.baseURL =
     process.env.NODE_ENV === 'production' ? "http://devopsinfoane.site" : "http://localhost:5000";