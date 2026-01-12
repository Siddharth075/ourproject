import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Serve public folder (CSS, JS, Images, Fonts)
app.use(express.static(path.join(__dirname, "public")));

// =============================
// Serve index.html from root
// =============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});
app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "../contact.html"));
});
app.get("/price", (req, res) => {
    res.sendFile(path.join(__dirname, "../price.html"));
});
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../about.html"));
});
app.get((req, res) => {
    res.sendFile(path.join(__dirname, "../error.html"));
});


// =============================
// MongoDB Connection
// ============================
mongoose
  .connect("mongodb+srv://root:12345@sridev.avbkl1u.mongodb.net/?appName=sridev")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// =============================
// Schema & Model
// =============================

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["Online", "Offline"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

// =============================
// Handle Booking Form Submit
// =============================

app.post("/success", async (req, res) => {
    const { name, phone, email, date, time, mode } = req.body;

    try {
        // Save to MongoDB
        const booking = new Booking({
            name,
            phone,
            email,
            date,
            time,
            mode
        });

        await booking.save();

        // Save to record.txt
        const entry = `
Name: ${name}
Phone: ${phone}
Email: ${email}
Date: ${date}
Time: ${time}
Mode: ${mode}
Submitted At: ${new Date().toLocaleString()}
----------------------------------------
`;

        fs.appendFile(
            path.join(process.cwd(), "record.txt"),
            entry,
            (err) => {
                if (err) console.log("File write error:", err);
            }
        );

        // Send success page
        res.sendFile(path.join(__dirname,"..", "success.html"));

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).send("Error saving booking");
    }
});


// app.get("/submit", (req, res) => {
//     res.sendFile(path.join(__dirname, "../success.html"));
// });

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "../error.html"));
});

// =============================
// Start Server
// =============================

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});