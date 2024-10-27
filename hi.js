// Required dependencies
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");

// Create Express app
const app = express();
const port = 4055;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection parameters
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "mydatabase";
let db;

// Connect to MongoDB server
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

// Route to serve the HTML form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "employee.html"));
});

app.get("/login1", (req, res) => {
    res.sendFile(path.join(__dirname, "sigin.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "sign2.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get("/signup2", (req, res) => {
    res.sendFile(path.join(__dirname, 'signup2.html'));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/customer", (req, res) => {
    res.sendFile(path.join(__dirname, "customer.html"));
});

app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "error.html"));
});

app.get("/labourprofile", (req, res) => {
    res.sendFile(path.join(__dirname, "appoitment.html"));
});

app.get("/place-order", (req, res) => {
    res.sendFile(path.join(__dirname, "placeorder.html"))
});

// Route to handle labor profile form submission
app.post("/labourprofile", async (req, res) => {
    const { name, email, mobile, location, service, age, gender } = req.body;
    try {
        await db.collection("labourdetails").insertOne({ name, email, age, gender, mobile, location, service });
        res.redirect("/admin");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Route to display laborers for customer to choose from
app.get("/order", async (req, res) => {
    const workType = req.query.work; // Get selected work type from customer page

    try {
        // Query the database for laborers with the selected service
        const laborers = await db.collection("labdetails").find({ service: workType }).toArray();
        
        // Generate HTML to display the laborer cards
        let laborProfilesHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${workType} Laborers</title>
                <style>
                    body { background-color: #f2f2f2; color: #333; font-family: Arial, sans-serif; }
                    .container { width: 80%; margin: 20px auto; text-align: center; }
                    .labour-card { background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: 20px 0; padding: 20px; text-align: left; }
                    .labour-card h2 { color: #007BFF; }
                    .select-btn { background-color: #007BFF; color: white; padding: 10px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Select a ${workType}</h1>
        `;

        // Loop through the laborers and create a card for each
        laborers.forEach(laborer => {
            laborProfilesHtml += `
                <div class="labour-card">
                    <h2>${laborer.name}</h2>
                    <p><strong>Age:</strong> ${laborer.age}</p>
                    <p><strong>Gender:</strong> ${laborer.gender}</p>
                    <p><strong>Occupation:</strong> ${laborer.service}</p>
                    <p><strong>Location:</strong> ${laborer.loc}</p>
                    <a href="/place-order?laborer=${laborer._id}" class="select-btn">Book</a>
                </div>
            `;
        });

        laborProfilesHtml += `
                </div>
            </body>
            </html>
        `;

        // Send the constructed HTML response
        res.send(laborProfilesHtml);
    } catch (err) {
        console.error("Error retrieving labor profiles:", err);
        res.status(500).send("Failed to fetch labor profiles");
    }
});

// Route to handle placing an order
app.post("/place-order", async (req, res) => {
    const { laborerId, date, time } = req.body; // Ensure these fields are in the form
    
    try {
        // Fetch the selected laborer details from the database
        const selectedLaborer = await db.collection("labdetails").findOne({ _id: new ObjectId(laborerId) });
        
        if (!selectedLaborer) {
            return res.status(404).send("Laborer not found");
        }

        // Insert the order into the 'orders' collection
        await db.collection("orders").insertOne({
            customerName: "Customer Name", // Replace with actual customer data
            customerEmail: "customer@example.com", // Replace with actual customer email
            laborerId: new ObjectId(laborerId), // Corrected ObjectId usage
            laborerName: selectedLaborer.name,
            service: selectedLaborer.service,
            location: selectedLaborer.loc,
            date,
            time,
            status: "pending"
        });

        res.redirect("/customer-bookings"); // Redirect to customer bookings page
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).send("Failed to place order");
    }
});

// More routes (signup, login, etc.) go here

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
