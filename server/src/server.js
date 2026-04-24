const express = require("express");
const route = require("./routes/route");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

route(app);

app.listen(3000, () => {
    console.log("Server is running on port 3000...");
    console.log("http://localhost:3000");
});