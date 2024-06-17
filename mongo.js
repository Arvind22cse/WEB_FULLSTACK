// Required dependencies
const express = require("express");
const { MongoClient } = require("mongodb");
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
    res.sendFile(path.join(__dirname,'signup2.html'));
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
app.get("/order", async (req, res) => {
    try {
       
        const items = await db.collection("items").find().toArray();
console.log(items);
        // Check if work is in query parameters
        const { work } = req.query;
        console.log(work);
        // Ensure work is provided in the query parameters
        if (!work) {
            return res.status(400).send("Work parameter is required");
        }
        const selected = await db.collection("items").findOne({ type: "Plumber" });
        console.log("Selected item:", selected);
        
        // Find the item that matches the work type
        const selectedItem = items.find(item => item.type === work );


console.log(selectedItem);
        if (!selectedItem) {
            return res.status(404).send(`No item found for work type: ${work}`);
        }

        // Construct the HTML response dynamically with fetched items
        let tableContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Employee</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        background-color: rgb(74, 82, 112);
                        color: white;
                    }
                    .container {
                        background-color: rgba(0, 0, 0, 0.8);
                        border-radius: 10px;
                        padding: 20px;
                        margin-top: 50px;
                    }
                    .btn-order {
                        background-color: #007bff;
                        color: white;
                    }
                    .btn-order:hover {
                        background-color: blue;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Employee</h1>
                    <form action="/place-order" method="post" onsubmit="return sub()">
                        <div class="mb-3">
                            <label for="name" class="form-label">Name:</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email:</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="work" class="form-label">Employee Type:</label>
                            <select class="form-control" id="work" name="work" required>
                                <option value="${selectedItem.type}">${selectedItem.type}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="price" class="form-label">Price per Employee:</label>
                            <select class="form-control" id="price" name="price" required>
                                <option value="${selectedItem.price}">${selectedItem.price}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="emp" class="form-label">Available Employees:</label>
                            <input type="hidden" id="availableEmployees" value="${selectedItem.employee}">
                            <select class="form-control" id="emp" name="emp" required>
                                <option value="${selectedItem.employee}">${selectedItem.employee}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Number of Employees:</label>
                            <input type="number" class="form-control" id="quantity" name="quantity" required>
                        </div>
                        <button type="submit" class="btn btn-order">Place Order</button>
                    </form>
                    <p id="error-message" style="color: red; display: none;">Order cannot be placed. Insufficient available employees.</p>
                </div>
                <script>
                    function sub() {
                        const availableEmployees = parseInt(document.getElementById("availableEmployees").value);
                        const requestedQuantity = parseInt(document.getElementById("quantity").value);

                        if (requestedQuantity > availableEmployees) {
                            document.getElementById("error-message").style.display = "block";
                            return false;
                        }

                        return true;
                    }
                </script>
            </body>
            </html>
        `;

        res.send(tableContent);
    } catch (err) {
        console.error("Error retrieving data from MongoDB:", err);
        res.status(500).send("Failed to fetch data from MongoDB");
    }
});




app.post("/place-order", async (req, res) => {
    const { name, email, work, price, quantity } = req.body;
    const totalPrice = price * quantity;

    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    
    try {
        await db.collection("orders").insertOne({ name, email, work, price, quantity, totalPrice });
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Placed</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        background-color: rgb(74, 82, 112);
                        color: white;
                    }
                    .container {
                        background-color: rgba(0, 0, 0, 0.8);
                        border-radius: 10px;
                        padding: 20px;
                        margin-top: 50px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Placed</h1>
                    <p>Thank you for your order, ${name}. Your order for ${quantity} ${work} is total of rs.${totalPrice}</p>
                    <a href="/customer" class="btn btn-primary">Back to Home</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).send("Failed to place order");
    }
});

// Route to handle order approval by admin
app.get("/admin/orders", async (req, res) => {
    try {
        const orders = await db.collection("orders").find({ status: "Pending" }).toArray();
        let tableContent = "<h1>Pending Orders</h1><table border='1'><tr><th>Name</th><th>Email</th><th>Employee Type</th><th>Quantity</th><th>Total Price</th><th>Action</th></tr>";
        tableContent += orders.map(order => `
            <tr>
                <td>${order.name}</td>
                <td>${order.email}</td>
                <td>${order.work}</td>
                <td>${order.quantity}</td>
                <td>₹${order.totalPrice}</td>
                <td>
                    <form action="/admin/approve-order" method="post" style="display:inline;">
                        <input type="hidden" name="id" value="${order._id}">
                        <input type="hidden" name="work" value="${order.work}">
                        <input type="hidden" name="quantity" value="${order.quantity}">
                        <button type="submit" class="btn btn-success">Approve</button>
                    </form>
                    <form action="/admin/reject-order" method="post" style="display:inline;">
                        <input type="hidden" name="id" value="${order._id}">
                        <button type="submit" class="btn btn-danger">Reject</button>
                    </form>
                </td>
            </tr>`).join("");
        tableContent += "</table><a href='/admin'>Back to Admin Home</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Failed to fetch orders");
    }
});

app.post("/admin/approve-order", async (req, res) => {
    const { id, work, quantity } = req.body;

    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    
    try {
        const result = await db.collection("orders").updateOne({ _id: new MongoClient.ObjectID(id) }, { $set: { status: "Approved" } });
        await db.collection("items").updateOne({ type: work }, { $inc: { employee: -quantity } });
        res.redirect("/admin/orders");
    } catch (err) {
        console.error("Error approving order:", err);
        res.status(500).send("Failed to approve order");
    }
});

app.post("/admin/reject-order", async (req, res) => {
    const { id } = req.body;

    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    
    try {
        const result = await db.collection("orders").updateOne({ _id: new MongoClient.ObjectID(id) }, { $set: { status: "Rejected" } });
        res.redirect("/admin/orders");
    } catch (err) {
        console.error("Error rejecting order:", err);
        res.status(500).send("Failed to reject order");
    }
});

// Route to handle form submission and insert data into MongoDB
app.post("/insert", async (req, res) => {
    const { type, employee, price } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const result = await db.collection("items").insertOne({ type, employee, price });
        console.log("Number of documents inserted: " + result.insertedCount);
        res.redirect("/admin");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Endpoint to retrieve and display a simple report from MongoDB
app.get("/view", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray();
        console.log(items);

        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Type</th><th>No of Employees</th><th>Cost</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.type}</td><td>${item.employee}</td><td>${item.price}</td></tr>`).join("");
        tableContent += "</table><a href='/admin'>Back to form</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});
app.get("/viewcus", async (req, res) => {
    try {
        // await db.collection("orders").insertOne({ name, email, work, price, quantity, totalPrice });
        const items = await db.collection("orders").find().toArray();
        console.log(items);

        let tableContent = "<h1>Report</h1><table border='1'><tr><th>Name of the customer</th><th>Email id</th><th>Type of Workers</th> <th>Quantity</th><th>Total Price</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.email}</td><td>${item.work}</td><td>${item.quantity}</td><td>${item.totalPrice}</td></tr>`).join("");
        tableContent += "</table><a href='/admin'>Back to form</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

app.post("/signup", async (req, res) => {
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        await db.collection("ad").insertOne({ email, pass });
        console.log("User inserted successfully");
        res.redirect("/login1"); 
    } catch (err) {
        console.error("Error inserting user data:", err);
        res.status(500).send("Failed to sign up");
    }
});


app.post("/login1", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        
        if (await db.collection("ad").findOne({email,pass})) {
            console.log("User authenticated successfully");
            
            res.redirect("/admin"); 
        } else {
            console.log("Authentication failed");
            res.redirect("/error"); 
        }
    }
    catch (err) {
        console.error("Error during authentication:", err);
        res.status(500).send("Failed to login");
    }
});

app.post("/signup2", async (req, res) => {
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        await db.collection("cus").insertOne({ email, pass });
        console.log("User inserted successfully");
        res.redirect("/login"); 
    } catch (err) {
        console.error("Error inserting user data:", err);
        res.status(500).send("Failed to sign up");
    }
});


app.post("/login", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        
        if (await db.collection("cus").findOne({email,pass})) {
            console.log("User authenticated successfully");
            
            res.redirect("/customer"); 
        } else {
            console.log("Authentication failed");
            res.redirect("/error"); 
        }
    }
    catch (err) {
        console.error("Error during authentication:", err);
        res.status(500).send("Failed to login");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
