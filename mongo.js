// Required dependencies
const express = require("express");
//const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

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
// app.get("/labourprofile",(req,res)=>{
//     res.sendFile(path.join(__dirname, "appoitment.html"));
// });
app.get("/place-order",(req,res)=>{
    res.sendFile(path.join(__dirname, "placeorder.html"))
})
// app.post("/labourprofile", async (req, res) => {
//     const { name, email, mobile, location, service,age,gender } = req.body;
//     try {
//         await db.collection("labourdetails").insertOne({ name, email,age,gender, mobile, location, service });
//         res.redirect("/admin");
//     } catch (err) {
//         console.error("Error inserting data:", err);
//         res.status(500).send("Failed to insert data");
//     }
// });
// app.get("/labourprofile", async (req, res) => {
// //    const laborerEmail = "labor@example.com"; // Replace with logged-in laborer's email

//     try {
        // Fetch orders for the laborer
        
    //     let laborerOrdersHtml = `
    //         <!DOCTYPE html>
    //         <html lang="en">
    //         <head>
    //             <meta charset="UTF-8">
    //             <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //             <title>Appointments</title>
    //             <style>
    //                 .order-card { background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
    //                 .order-card h2 { color: #007BFF; }
    //                 .action-btn { padding: 10px 20px; margin-right: 10px; cursor: pointer; }
    //                 .accept-btn { background-color: #28a745; color: white; }
    //                 .reject-btn { background-color: #dc3545; color: white; }
    //             </style>
    //         </head>
    //         <body>
    //             <h1>Appointments</h1>
    //     `;

    //     orders.forEach(order => {
    //         laborerOrdersHtml += `
    //             <div class="order-card">
    //                 <h2>Customer: ${order.customerName}</h2>
    //                 <p><strong>Service:</strong> ${order.service}</p>
    //                 <p><strong>Date:</strong> ${order.date}</p>
    //                 <p><strong>Time:</strong> ${order.time}</p>
    //                 <button class="action-btn accept-btn" onclick="handleAction('${order._id}', 'accepted')">Accept</button>
    //                 <button class="action-btn reject-btn" onclick="handleAction('${order._id}', 'rejected')">Reject</button>
    //             </div>
    //         `;
    //     });

    //     laborerOrdersHtml += `
    //         <script>
    //             function handleAction(orderId, action) {
    //                 fetch('/update-order', {
    //                     method: 'POST',
    //                     headers: { 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ orderId, action })
    //                 }).then(response => response.json())
    //                 .then(data => { if (data.success) window.location.reload(); })
    //                 .catch(err => console.error('Error:', err));
    //             }
    //         </script>
    //         </body>
    //         </html>
    //     `;

    //     res.send(laborerOrdersHtml);
    // } catch (err) {
    //     console.error("Error fetching laborer appointments:", err);
    //     res.status(500).send("Failed to fetch appointments");
    // }
    app.get("/labourprofile", async (req, res) => {
        try {
            // Fetch data from MongoDB
            const orders = await db.collection("appointments").find({}).toArray();
            const customers = await db.collection("customers").find({}).toArray();
    
            // Log data to check if it exists
            console.log("Orders:", orders);
            console.log("Customers:", customers);
    
            // If no data found, return an error message
            if (!orders.length || !customers.length) {
                return res.send("<h1>No appointments or customers found</h1>");
            }
    
            // Initialize HTML template
            let customerBookingsHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>My Appointments</title>
                    <style>
                        .booking-card { background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
                        h1 { color: #007BFF; }
                    </style>
                </head>
                <body>
                    <h1>My Appointments</h1>
            `;
    
            // Loop through orders and display customer data
            orders.forEach((order, index) => {
                const customer = customers[index];  // Assuming 1-to-1 mapping of orders and customers based on index
    
                if (customer) {
                    customerBookingsHtml += `
                        <div class="booking-card">
                            <h2>Name: ${customer.name}</h2>
                            <p><strong>Email:</strong> ${customer.email}</p>
                            <p><strong>Mobile:</strong> ${customer.mobile}</p>
                            <p><strong>Location:</strong> ${customer.loc}</p>
                        </div>
                    `;
                } else {
                    customerBookingsHtml += `<p>No customer data for this order</p>`;
                }
            });
    
            // Close HTML template
            customerBookingsHtml += "</body></html>";
    
            // Send the rendered HTML
            res.send(customerBookingsHtml);
    
        } catch (err) {
            console.error("Error fetching customer bookings:", err);
            res.status(500).send("Failed to fetch bookings");
        }
    });
    
app.post("/update-order", async (req, res) => {
    const { orderId, action } = req.body;

    try {
        await db.collection("orders").updateOne(
            { _id: new MongoClient.ObjectId(orderId) },
            { $set: { status: action } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).json({ success: false });
    }
});
app.get("/customer/bookings", async (req, res) => {
    //const customerEmail = "john@example.com"; // Replace with logged-in customer's email

    try {
        const orders = await db.collection("appointments").find({}).toArray();
        const data=await db.collection("customers").find({}).toArray();
        let customerBookingsHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>My Bookings</title>
                <style>
                    .booking-card { background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h1>My Bookings</h1>
        `;

        orders.forEach(order => {
            customerBookingsHtml += `
                <div class="booking-card">
                    <h2>Name:${data.name}</h2>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Mobile:</strong> ${data.mobile}</p>
                    <p><strong>location:</strong> ${data.loc}</p>
                </div>
            `;
        });
    
        customerBookingsHtml += "</body></html>";

        res.send(customerBookingsHtml);
    } catch (err) {
        console.error("Error fetching customer bookings:", err);
        res.status(500).send("Failed to fetch bookings");
    }
});

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


app.post("/place-order", async (req, res) => {
    const { time } = req.body; // Now using req.body for POST request

    try {
        // Store order details in the database
        await db.collection("appointments").insertOne({
            time,
            // Add other relevant details here
        });

        // Respond with success or redirect
        res.send("Order placed successfully!");
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).send("Failed to place order");
    }
});



// app.post("/update",async(req,res)=>{

    

// });

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
        const items = await db.collection("appoitment").find().toArray();
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
   // const { email, pass } = req.body;
    const { name, email, pass,mobile, loc, service,age,gender } = req.body;
    try {
        await db.collection("labdetails").insertOne({ name, email,pass,age,gender, mobile, loc, service });
        res.redirect("/login");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
   
});


app.post("/login1", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        
        if (await db.collection("customers").findOne({email,pass})) {
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

app.post("/signup2", async (req, res) => {
    //const { email, pass } = req.body;
    const { name, email, pass,mobile, loc} = req.body;
    try {
        await db.collection("customers").insertOne({ name, email,pass,mobile, loc });
        res.redirect("/login1");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
  
});


app.post("/login", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        
        if (await db.collection("labdetails").findOne({email,pass})) {
            console.log("User authenticated successfully");
            
            res.redirect("/labourprofile"); 
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
// app.post("/admin",async(req,res)=>{
//     const {type,employee,price}=req.body;

// })

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
