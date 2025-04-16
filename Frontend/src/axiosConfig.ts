import axios from "axios";

axios.defaults.baseURL =
     import.meta.env.MODE === "production"
          ? import.meta.env.VITE_PROD
          : import.meta.env.VITE_LOCAL;

