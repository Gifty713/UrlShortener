import express from "express";

const app = express(); // creating express app
app.use(express.json());

export default app;