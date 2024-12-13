// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const app = express();
const port = 19000;
const secretKey = 'your_secret_key';

app.use(bodyParser.json());
app.use(express.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // For U
// MySQL connection setup
// PostgreSQL pool setup
const db = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'user',
    database: 'unitech',
    port: 5432,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// // Authentication endpoint
// app.post('/authentication', (req, res) => {
//     const { customerId } = req.body;

//     const query = 'SELECT * FROM register_tbl WHERE customerId = ?';
//     db.query(query, [customerId], (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (results.length > 0) {
//             const token = jwt.sign({ userId: results[0].id, username: results[0].username }, secretKey, { expiresIn: '1h' });
//             res.status(200).json({ message: 'Login successful', token, username: results[0].username, number: results[0].phone_number, role: results[0].role });
//             console.log("User authenticated successfully:", results[0].customerId);
//         } else {
//             res.status(401).json({ message: 'Invalid credentials' });
//         }
//     });
// });
// Authentication endpoint
app.post('/authentication', (req, res) => {
    const { username, customerId } = req.body;

    // Correct PostgreSQL query with positional placeholders
    const query = 'SELECT * FROM register_tbl WHERE username = $1 AND customerid = $2';

    // Execute query with correct placeholders
    db.query(query, [username, customerId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.rows.length > 0) {
            const user = results.rows[0];  // Use `results.rows` for PostgreSQL
            const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
            res.status(200).json({
                message: 'Login successful',
                token,
                username: user.username,
                number: user.phone_number,
                role: user.role,
                status: user.status
            });
            console.log("User authenticated successfully:", user.customerid);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


// app.post('/registration', (req, res) => {
//     const {
//         customerId, fullName, username, southAfricanNumber, eswatiniNumber, email,
//         residentialAddress, base64Img1, base64Img, package // Added 'package'
//     } = req.body;
//     console.log("package............", package)
//     // Check for required fields
//     if (!customerId || !fullName || !username || !southAfricanNumber || !eswatiniNumber || !email ||
//         !residentialAddress || !base64Img1 || !base64Img || !package) { // Check for 'package'
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//     }
//     const role = "user";
//     const decodedImage1 = Buffer.from(base64Img1, "base64");
//     const decodedImage = Buffer.from(base64Img, "base64");
//     // First insert query
//     const query1 = `
//         INSERT INTO register_tbl (
//             customerId,fullName, username, southAfricanNumber, phone_number, email, residentialAddress, role,
//             nationalIDImage, photoImage, registrationDate, subscriptionStatus, walletBalance
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, 0.00)
//     `;
//     const values1 = [customerId, fullName, username, southAfricanNumber, eswatiniNumber, email, residentialAddress, role, decodedImage1, decodedImage];

//     // Execute first query
//     db.query(query1, values1, (error, results) => {
//         if (error) {
//             console.error('Error inserting data into register_tbl:', error);
//             return res.status(500).json({ success: false, message: 'Database error' });
//         }

//         // Second insert query
//         const query2 = `
//             INSERT INTO details (
//                 customerId, username, phone_number, current_account, south_number, email, 
//                 current_package, registrationDate, amount
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0.00)
//         `;
//         const values2 = [customerId, fullName, eswatiniNumber, customerId, southAfricanNumber, email, package]; // Include 'package'

//         // Execute second query
//         db.query(query2, values2, (error, results) => {
//             if (error) {
//                 console.error('Error inserting data into details:', error);
//                 return res.status(500).json({ success: false, message: 'Database error' });
//             }
//             // Second insert query
//             const RsaId = "0000000000000"
//             const RsaPhysicalAddress = "e.g Town,City,Country"
//             const DstvAccCustNo = "000000"
//             const balanceDue = "0.00"
//             const dueDate = "DD"

//             const query3 = `
// INSERT INTO tblrsadetails (
//     customerId, RsaId, RsaPhysicalAddress, RsaCellNumber, DstvAccCustNo, balanceDue, dueDate
// ) VALUES (?, ?, ?, ?, ?, ?, ?)
// `;
//             const values3 = [customerId, RsaId, RsaPhysicalAddress, southAfricanNumber, DstvAccCustNo, balanceDue, dueDate]; // Include 'package'

//             // Execute second query
//             db.query(query3, values3, (error, results) => {
//                 if (error) {
//                     console.error('Error inserting data into tblrsadetails:', error);
//                     return res.status(500).json({ success: false, message: 'Database error' });
//                 }
//                 // Successful registration
//                 res.status(200).json({ success: true, message: 'Registration successful' });
//             });
//         });
//     });
// });

app.post('/registration', (req, res) => {
    const {
        customerId, fullName, username, email,
    } = req.body;
    console.log("package............", customerId, fullName, username, email)

    if (!customerId || !fullName || !username || !email) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const role = "user";
    const status = "0";

    // First insert query
    const query1 = `
        INSERT INTO register_tbl (
            customerid, fullname, username, email, role, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values1 = [customerId, fullName, username, email, role, status];

    // Execute first query
    db.query(query1, values1, (error, results) => {
        if (error) {
            console.error('Error inserting data into register_tbl:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Second insert query
        const query2 = `
            INSERT INTO details (
                customerid, fullname, username, current_account, email, registrationdate
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `;
        const values2 = [customerId, fullName, username, customerId, email];

        db.query(query2, values2, (error, results) => {
            if (error) {
                console.error('Error inserting data into details:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            // Third insert query
            const RsaId = "0000000000000";
            const RsaPhysicalAddress = "e.g Town,City,Country";
            const DstvAccCustNo = "000000";
            const southAfricanNumber = "0000000000000";
            const balanceDue = "0.00";
            const dueDate = "DD";

            const query3 = `
                INSERT INTO tblrsadetails (
                    customerid, rsaid, rsaphysicaladdress, rsacellnumber, dstvacccustno, balancedue, duedate
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const values3 = [customerId, RsaId, RsaPhysicalAddress, southAfricanNumber, DstvAccCustNo, balanceDue, dueDate];

            db.query(query3, values3, (error, results) => {
                if (error) {
                    console.error('Error inserting data into tblrsadetails:', error);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                // Successful registration
                res.status(200).json({ success: true, message: 'Registration successful' });
            });
        });
    });
});


// Handle PUT request for ID verification
app.put('/idVerification/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const { southAfricanNumber, eswatiniNumber, residentialAddress, base64Img1, base64Img, package } = req.body;
    console.log("Trying to verify customer...", customerId, southAfricanNumber, eswatiniNumber, residentialAddress);

    // Validate required fields
    if (!customerId || !southAfricanNumber || !eswatiniNumber || !residentialAddress || !base64Img1 || !base64Img) {
        res.status(400).send('Bad Request: All fields are required');
        return;
    }

    const decodedImage1 = Buffer.from(base64Img1, "base64");
    const decodedImage = Buffer.from(base64Img, "base64");
    console.log(decodedImage1)
    // Query to update customer verification details
    const query1 = `
    UPDATE register_tbl
    SET
        southafricannumber = $1, 
        phone_number = $2, 
        residentialaddress = $3, 
        nationalidimage = $4, 
        photoimage = $5, 
        status = '1'
    WHERE status = '0' AND customerid = $6
`;

    // Execute query1
    db.query(query1, [southAfricanNumber, eswatiniNumber, residentialAddress, decodedImage1, decodedImage, customerId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        const amount = "0.00";

        // Query to update details table
        const query2 = `
        UPDATE details
        SET
            south_number = $1, 
            phone_number = $2, 
            current_package = $3, 
            amount = $4
        WHERE customerid = $5
    `;

        // Execute query2
        db.query(query2, [southAfricanNumber, eswatiniNumber, package, amount, customerId], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send('Internal server error');
                return;
            }

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: 'Customer verification updated successfully' });
                console.log("Customer verification updated successfully");
            } else {
                res.status(404).send('No customer found');
                console.log("No customer found");
            }
        });
    });
});

app.get('/getDetails', (req, res) => {
    const { customerId } = req.query;
    console.log("GETTING..............DETAILS", customerId)

    // Check if customerId is provided
    if (!customerId) {
        console.error('customerId is missing in the query parameters');
        res.status(400).send('Bad Request: customerId is required');
        return;
    }

    // Query to get details for the specific customerId
    const query = 'SELECT * FROM details WHERE customerid = $1';

    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log("Reached here......userData.......", customerId);

        // Check if any data was returned
        if (results.rows.length > 0) {
            res.status(200).json(results.rows);  // Send the rows from the query
            console.log("Reached here.............", results.rows);
        } else {
            console.log('No details found for the provided customerId');
            res.status(404).send('No details found for the provided customerId');
        }
    });
});




app.get('/getTransactions', (req, res) => {
    const { customerId } = req.query;
    if (!customerId) {
        console.error('customerId is missing in the query parameters');
        res.status(400).send('Bad Request: customerId is required');
        return;
    }

    const query = 'SELECT * FROM transactions WHERE customerid = $1';
    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        console.log("i reach here......transactions.......", customerId);

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided customerId');
            res.status(404).send('No details found for the provided customerId');
        }
    });
});
app.get('/getRequestToPay', (req, res) => {
    // const { customerId } = req.query;
    // if (!customerId) {
    //     console.error('customerId is missing in the query parameters');
    //     res.status(400).send('Bad Request: customerId is required');
    //     return;
    // }

    const query = 'SELECT * FROM request_to_pay';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        // console.log("i reach here......transactions.......", customerId);

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided customerId');
            res.status(404).send('No details found for the provided customerId');
        }
    });
});

// Define the endpoint to get the packages
app.get('/getPackages', (req, res) => {
    const query = 'SELECT * FROM packages';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Server error');
            return;
        }

        // Use `results.rows` for PostgreSQL
        if (results.rows.length > 0) {
            res.status(200).json(results.rows);
            console.log("i reach here......packages.......", results.rows);
        } else {
            console.log('No packages found');
            res.status(404).send('No packages found');
        }
    });
});


// Create `/Upgrade` endpoint
app.post('/Upgrade', (req, res) => {
    const {
        customerId,
        username,
        current_account,
        current_package,
        southAfricanNumber,
        eswatiniNumber,
        UpgradePackage
    } = req.body;

    const query = `
        INSERT INTO request_upgrade (customerId, username, current_account, current_package, south_number, phone_number, upgrade_package, upgrade_date, status, upgrade_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'PENDING', 'PENDING')
    `;

    db.query(query, [customerId, username, current_account, current_package, southAfricanNumber, eswatiniNumber, UpgradePackage], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Failed to submit upgrade request' });
            return;
        }
        res.status(200).json({ message: 'Upgrade request submitted successfully' });
    });
});
// Create `/Upgrade` endpoint
app.post('/Downgrade', (req, res) => {
    const {
        customerId,
        username,
        current_account,
        current_package,
        southAfricanNumber,
        eswatiniNumber,
        DowngradePackage
    } = req.body;

    const query = `
        INSERT INTO request_downgrade (customerId, username, current_account, current_package, south_number, phone_number, downgrade_package, downgrade_date, status, downgrade_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'PENDING', 'PENDING')
    `;

    db.query(query, [customerId, username, current_account, current_package, southAfricanNumber, eswatiniNumber, DowngradePackage], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Failed to submit upgrade request' });
            return;
        }
        res.status(200).json({ message: 'Downgrade request submitted successfully' });
    });
});
// Create `/Upgrade` endpoint
app.post('/RegisterDSTV', (req, res) => {
    const {
        customerId,
        username,
        current_account,
        current_package,
        south_number,
        phone_number,
        email,

    } = req.body;

    const query = `
        INSERT INTO register_dstv (customerid, username, current_account, current_package, south_number, phone_number,email, register_dstv_date, status, register_dstv_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'PENDING', 'PENDING')
    `;

    db.query(query, [customerId, username, current_account, current_package, south_number, phone_number, email], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Failed to submit upgrade request' });
            return;
        }
        res.status(200).json({ message: 'Register DSTV request submitted successfully' });
    });
});
// Create `/Upgrade` endpoint
app.post('/Reconnect', (req, res) => {
    const {
        customerId,
        username,
        current_account,
        current_package,
        south_number,
        phone_number,
        email,

    } = req.body;

    const query = `
        INSERT INTO reconnect_dstv (customerid, username, current_account, current_package, south_number, phone_number,email, reconnect_dstv_date, status, reconnect_dstv_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 'PENDING', 'PENDING')
    `;

    db.query(query, [customerId, username, current_account, current_package, south_number, phone_number, email], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Failed to submit upgrade request' });
            return;
        }
        res.status(200).json({ message: 'RE-Activate request submitted successfully' });
    });
});

// Create `/RequestToPay` endpoint
app.post('/RequestToPay', (req, res) => {
    const {
        customerId,
        username,
        current_account,
        current_package,
        // southAfricanNumber,
        // eswatiniNumber,
    } = req.body;

    const query = `
        INSERT INTO request_to_pay (customerid, username, current_account, current_package, requested_date, status, request_status)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'PENDING', 'SUBSCRIBE')
    `;

    db.query(query, [customerId, username, current_account, current_package], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Failed to submit upgrade request' });
            return;
        }
        res.status(200).json({ message: 'Request submitted successfully' });
    });
});

// Endpoint to handle upgrade requests
app.post('/requestToUpgrade', (req, res) => {
    const { customerId, username, current_account, current_selected_package, current_package } = req.body;
    console.log("current_selected_package..........", customerId, username, current_account, current_selected_package, current_package)
    if (!customerId || !username || !current_account || !current_selected_package || !current_package) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO request_upgrade (customerid, username, current_account,current_selected_package,current_package) VALUES ($1, $2, $3, $4, $5)';
    const values = [customerId, username, current_account, current_selected_package, current_package];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Failed to insert data:', err);
            return res.status(500).json({ error: 'Failed to insert data' });
        }
        res.status(200).json({ message: 'Upgrade request submitted successfully', result });
    });
});

// Endpoint to handle downgrade requests
app.post('/requestToDowngrade', (req, res) => {
    const { customerId, username, current_account, current_selected_package, current_package } = req.body;

    if (!customerId || !username || !current_account || !current_package) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO request_downgrade (customerId, username, current_account,current_selected_package, current_package) VALUES ($1, $2, $3, $4, $5)';
    const values = [customerId, username, current_account, current_selected_package, current_package];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Failed to insert data:', err);
            return res.status(500).json({ error: 'Failed to insert data' });
        }
        res.status(200).json({ message: 'Downgrade request submitted successfully', result });
    });
});

// UPDATE TABLES BY ADMIN



app.get('/getPayCustomers', (req, res) => {

    const query = 'SELECT * FROM request_to_pay WHERE request_status = "SUBSCRIBE"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided id');
            res.status(404).send('No details found for the provided id');
        }
    });
});


// Update Pay Customer endpoint
// app.put('/updatePayCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }

//     const query = 'UPDATE request_to_pay SET request_status = "SUB-PAID" WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (result.affectedRows > 0) {
//             res.status(200).send('Customer status updated successfully');
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });
// app.put('/updatePayCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }

//     // First, retrieve customerId and current_package using the provided id
//     const selectQuery = 'SELECT customerId, current_package FROM request_to_pay WHERE id = ?';
//     db.query(selectQuery, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing select query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (result.length > 0) {
//             const { customerId, current_package } = result[0];

//             // Query to get monthlyFee and service_fee from packages
//             const feeQuery = 'SELECT monthlyFee, service_fee FROM packages'; // Assuming package_name relates to current_package
//             db.query(feeQuery, [current_package], (err, feeResult) => {
//                 if (err) {
//                     console.error('Error executing fee query:', err);
//                     res.status(500).send('Internal server error');
//                     return;
//                 }

//                 if (feeResult.length > 0) {
//                     const { monthlyFee, service_fee } = feeResult[0];
//                     const amount = monthlyFee + service_fee; // Concatenate or sum the fees

//                     // Update the request_status
//                     const updateQuery = 'UPDATE request_to_pay SET request_status = "SUB-PAID" WHERE id = ?';
//                     db.query(updateQuery, [id], (err, updateResult) => {
//                         if (err) {
//                             console.error('Error executing update query:', err);
//                             res.status(500).send('Internal server error');
//                             return;
//                         }

//                         if (updateResult.affectedRows > 0) {
//                             const description = "Paid DSTV Channel"
//                             // Insert the customerId, current_package, amount, and date into the transactions table
//                             const insertQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
//                             const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
//                             db.query(insertQuery, [customerId, description, amount, currentDate], (err, insertResult) => {
//                                 if (err) {
//                                     console.error('Error executing insert query:', err);
//                                     res.status(500).send('Internal server error');
//                                     return;
//                                 }

//                                 res.status(200).send('Customer status updated and transaction recorded successfully');
//                             });
//                         } else {
//                             res.status(404).send('No customer found with the provided id');
//                         }
//                     });
//                 } else {
//                     res.status(404).send('No package found with the provided current_package');
//                 }
//             });
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });
app.put('/updatePayCustomer', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).send('Bad Request: id is required');
        return;
    }

    // First, retrieve customerId and current_package using the provided id
    const selectQuery = 'SELECT customerId, current_package FROM request_to_pay WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            const { customerId, current_package } = result[0];

            // Query to get monthlyFee and service_fee from packages
            const feeQuery = 'SELECT monthlyFee, service_fee FROM packages'; // Assuming package_name relates to current_package
            db.query(feeQuery, [current_package], (err, feeResult) => {
                if (err) {
                    console.error('Error executing fee query:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                if (feeResult.length > 0) {
                    // Convert monthlyFee and service_fee to numbers before adding
                    const monthlyFee = parseFloat(feeResult[0].monthlyFee);
                    const service_fee = parseFloat(feeResult[0].service_fee);
                    const totalAmount = monthlyFee + service_fee; // Sum the fees
                    const formattedAmount = `+${totalAmount}.00 SZL`; // Format the amount as a string

                    // Update the request_status
                    const updateQuery = 'UPDATE request_to_pay SET request_status = "SUB-PAID" WHERE id = ?';
                    db.query(updateQuery, [id], (err, updateResult) => {
                        if (err) {
                            console.error('Error executing update query:', err);
                            res.status(500).send('Internal server error');
                            return;
                        }

                        if (updateResult.affectedRows > 0) {
                            const description = "Paid DSTV Channel";
                            // Insert the customerId, description, formatted amount, and date into the transactions table
                            const insertQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
                            const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                            db.query(insertQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
                                if (err) {
                                    console.error('Error executing insert query:', err);
                                    res.status(500).send('Internal server error');
                                    return;
                                }

                                res.status(200).send('Customer status updated and transaction recorded successfully');
                            });
                        } else {
                            res.status(404).send('No customer found with the provided id');
                        }
                    });
                } else {
                    res.status(404).send('No package found with the provided current_package');
                }
            });
        } else {
            res.status(404).send('No customer found with the provided id');
        }
    });
});


app.get('/getUpgradeCustomers', (req, res) => {

    const query = 'SELECT * FROM request_upgrade WHERE upgrade_status = "PENDING"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided id');
            res.status(404).send('No details found for the provided id');
        }
    });
});

// app.put('/updateUpgradeCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }
//     const selectQuery = 'SELECT customerId, current_selected_package FROM request_upgrade WHERE id = ?';
//     db.query(selectQuery, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing select query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//     const query = 'UPDATE request_upgrade SET upgrade_status = "UPGRADED" WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }
//         const updateQuery = 'UPDATE details SET current_package = (current_selected_package) WHERE customerId = ?';
//         db.query(updateQuery, [customerId], (err, updateResult) => {
//             if (err) {
//                 console.error('Error executing update query:', err);
//                 res.status(500).send('Internal server error');
//                 return;
//             }
//             if (result.length > 0) {
//                 const { customerId, current_package } = result[0];

//                 // Query to get monthlyFee and service_fee from packages
//                 const feeQuery = 'SELECT monthlyFee, service_fee FROM packages';
//                 db.query(feeQuery, [current_package], (err, feeResult) => {
//                     if (err) {
//                         console.error('Error executing fee query:', err);
//                         res.status(500).send('Internal server error');
//                         return;
//                     }

//                     if (feeResult.length > 0) {
//                         // Convert monthlyFee and service_fee to numbers before adding
//                         const monthlyFee = parseFloat(feeResult[0].monthlyFee);
//                         const service_fee = parseFloat(feeResult[0].service_fee);
//                         const totalAmount = monthlyFee + service_fee; // Sum the fees
//                         const formattedAmount = `+${totalAmount}.00 SZL`; // Format the amount as a string




//             if (updateResult.affectedRows > 0) {
//                 const description = "Upgrading DSTV Channel";
//                 // Insert the customerId, description, formatted amount, and date into the transactions table
//                 const insertQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
//                 const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
//                 db.query(insertQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
//                     if (err) {
//                         console.error('Error executing insert query:', err);
//                         res.status(500).send('Internal server error');
//                         return;
//                     }
//         if (result.affectedRows > 0) {
//             res.status(200).send('Customer status updated successfully');
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });

app.put('/updateUpgradeCustomer', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).send('Bad Request: id is required');
        return;
    }

    // First, retrieve customerId and current_selected_package using the provided id
    const selectQuery = 'SELECT customerId, current_selected_package FROM request_upgrade WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            const { customerId, current_selected_package } = result[0];

            // Update the upgrade_status to "UPGRADED"
            const updateStatusQuery = 'UPDATE request_upgrade SET upgrade_status = "UPGRADED" WHERE id = ?';
            db.query(updateStatusQuery, [id], (err, statusUpdateResult) => {
                if (err) {
                    console.error('Error executing status update query:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                if (statusUpdateResult.affectedRows > 0) {
                    // Update the current_package in the details table
                    const updatePackageQuery = 'UPDATE details SET current_package = ? WHERE customerId = ?';
                    db.query(updatePackageQuery, [current_selected_package, customerId], (err, packageUpdateResult) => {
                        if (err) {
                            console.error('Error executing package update query:', err);
                            res.status(500).send('Internal server error');
                            return;
                        }

                        if (packageUpdateResult.affectedRows > 0) {
                            // Query to get monthlyFee and service_fee from packages based on current_selected_package
                            const feeQuery = 'SELECT monthlyFee, service_fee FROM packages';
                            db.query(feeQuery, [current_selected_package], (err, feeResult) => {
                                if (err) {
                                    console.error('Error executing fee query:', err);
                                    res.status(500).send('Internal server error');
                                    return;
                                }

                                if (feeResult.length > 0) {
                                    // Convert monthlyFee and service_fee to numbers before adding
                                    const monthlyFee = parseFloat(feeResult[0].monthlyFee);
                                    const service_fee = parseFloat(feeResult[0].service_fee);
                                    const totalAmount = monthlyFee + service_fee; // Sum the fees
                                    const formattedAmount = `+${totalAmount}.00 SZL`; // Format the amount as a string

                                    // Insert the transaction into the transactions table
                                    const description = "Upgrading DSTV Channel";
                                    const insertTransactionQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
                                    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                                    db.query(insertTransactionQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
                                        if (err) {
                                            console.error('Error executing insert query:', err);
                                            res.status(500).send('Internal server error');
                                            return;
                                        }

                                        res.status(200).send('Customer status updated and transaction recorded successfully');
                                    });
                                } else {
                                    res.status(404).send('No package found with the provided current_selected_package');
                                }
                            });
                        } else {
                            res.status(404).send('Failed to update current package in details table');
                        }
                    });
                } else {
                    res.status(404).send('Failed to update upgrade status');
                }
            });
        } else {
            res.status(404).send('No customer found with the provided id');
        }
    });
});

app.get('/getDowngradeCustomers', (req, res) => {

    const query = 'SELECT * FROM request_downgrade WHERE downgrade_status = "PENDING"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided id');
            res.status(404).send('No details found for the provided id');
        }
    });
});


// app.put('/updateDowngradeCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }

//     const query = 'UPDATE request_downgrade SET downgrade_status = "DOWNGRADED" WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (result.affectedRows > 0) {
//             res.status(200).send('Customer status updated successfully');
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });

app.put('/updateDowngradeCustomer', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).send('Bad Request: id is required');
        return;
    }

    // First, retrieve customerId and current_selected_package using the provided id
    const selectQuery = 'SELECT customerId, current_selected_package FROM request_downgrade WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            const { customerId, current_selected_package } = result[0];

            // Update the upgrade_status to "DOWNGRADED"
            const updateStatusQuery = 'UPDATE request_downgrade SET downgrade_status = "DOWNGRADED" WHERE id = ?';
            db.query(updateStatusQuery, [id], (err, statusUpdateResult) => {
                if (err) {
                    console.error('Error executing status update query:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                if (statusUpdateResult.affectedRows > 0) {
                    // Update the current_package in the details table
                    const updatePackageQuery = 'UPDATE details SET current_package = ? WHERE customerId = ?';
                    db.query(updatePackageQuery, [current_selected_package, customerId], (err, packageUpdateResult) => {
                        if (err) {
                            console.error('Error executing package update query:', err);
                            res.status(500).send('Internal server error');
                            return;
                        }

                        if (packageUpdateResult.affectedRows > 0) {
                            // Query to get monthlyFee and service_fee from packages based on current_selected_package
                            const feeQuery = 'SELECT monthlyFee, service_fee FROM packages';
                            db.query(feeQuery, [current_selected_package], (err, feeResult) => {
                                if (err) {
                                    console.error('Error executing fee query:', err);
                                    res.status(500).send('Internal server error');
                                    return;
                                }

                                if (feeResult.length > 0) {
                                    // Convert monthlyFee and service_fee to numbers before adding
                                    const monthlyFee = parseFloat(feeResult[0].monthlyFee);
                                    const service_fee = parseFloat(feeResult[0].service_fee);
                                    const totalAmount = monthlyFee + service_fee; // Sum the fees
                                    const formattedAmount = `-${totalAmount}.00 SZL`; // Format the amount as a string

                                    // Insert the transaction into the transactions table
                                    const description = "Downgrading DSTV Channel";
                                    const insertTransactionQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
                                    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                                    db.query(insertTransactionQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
                                        if (err) {
                                            console.error('Error executing insert query:', err);
                                            res.status(500).send('Internal server error');
                                            return;
                                        }

                                        res.status(200).send('Customer status updated and transaction recorded successfully');
                                    });
                                } else {
                                    res.status(404).send('No package found with the provided current_selected_package');
                                }
                            });
                        } else {
                            res.status(404).send('Failed to update current package in details table');
                        }
                    });
                } else {
                    res.status(404).send('Failed to update upgrade status');
                }
            });
        } else {
            res.status(404).send('No customer found with the provided id');
        }
    });
});


app.get('/getDecoderCustomers', (req, res) => {

    const query = 'SELECT * FROM register_dstv WHERE register_dstv_status = "PENDING"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided id');
            res.status(404).send('No details found for the provided id');
        }
    });
});

// app.put('/updateDecoderCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }

//     const query = 'UPDATE register_dstv SET register_dstv_status = "REGISTERED" WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (result.affectedRows > 0) {
//             res.status(200).send('Customer status updated successfully');
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });

app.put('/updateDecoderCustomer', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).send('Bad Request: id is required');
        return;
    }

    // First, retrieve customerId and current_package using the provided id
    const selectQuery = 'SELECT customerId, current_package FROM register_dstv WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            const { customerId, current_package } = result[0];

            // Update the register_dstv_status to "REGISTERED"
            const updateStatusQuery = 'UPDATE register_dstv SET register_dstv_status = "REGISTERED" WHERE id = ?';
            db.query(updateStatusQuery, [id], (err, statusUpdateResult) => {
                if (err) {
                    console.error('Error executing status update query:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                if (statusUpdateResult.affectedRows > 0) {
                    // Query to get monthlyFee and service_fee from packages based on current_package
                    const feeQuery = 'SELECT monthlyFee, service_fee FROM packages';
                    db.query(feeQuery, [current_package], (err, feeResult) => {
                        if (err) {
                            console.error('Error executing fee query:', err);
                            res.status(500).send('Internal server error');
                            return;
                        }

                        if (feeResult.length > 0) {
                            // Convert monthlyFee and service_fee to numbers before adding
                            const monthlyFee = parseFloat(feeResult[0].monthlyFee);
                            const service_fee = parseFloat(feeResult[0].service_fee);
                            const totalAmount = monthlyFee + service_fee; // Sum the fees
                            const formattedAmount = `+${totalAmount}.00 SZL`; // Format the amount as a string

                            // Insert the transaction into the transactions table
                            const description = "Register DSTV Decoder";
                            const insertTransactionQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
                            const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                            db.query(insertTransactionQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
                                if (err) {
                                    console.error('Error executing insert query:', err);
                                    res.status(500).send('Internal server error');
                                    return;
                                }

                                res.status(200).send('Customer status updated and transaction recorded successfully');
                            });
                        } else {
                            res.status(404).send('No package found with the provided current_package');
                        }
                    });
                } else {
                    res.status(404).send('Failed to update register_dstv_status');
                }
            });
        } else {
            res.status(404).send('No customer found with the provided id');
        }
    });
});


app.get('/getReActivateCustomers', (req, res) => {

    const query = 'SELECT * FROM reconnect_dstv WHERE reconnect_dstv_status = "PENDING"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
            console.log("i reach here.............", results);
        } else {
            console.log('No details found for the provided id');
            res.status(404).send('No details found for the provided id');
        }
    });
});

// app.put('/updateReActivateCustomer', (req, res) => {
//     const { id } = req.body;

//     if (!id) {
//         res.status(400).send('Bad Request: id is required');
//         return;
//     }

//     const query = 'UPDATE reconnect_dstv SET reconnect_dstv_status = "REACTIVATED" WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (result.affectedRows > 0) {
//             res.status(200).send('Customer status updated successfully');
//         } else {
//             res.status(404).send('No customer found with the provided id');
//         }
//     });
// });

app.put('/updateReActivateCustomer', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).send('Bad Request: id is required');
        return;
    }

    // First, retrieve customerId and current_package using the provided id
    const selectQuery = 'SELECT customerId, current_package FROM reconnect_dstv WHERE id = ?';
    db.query(selectQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            const { customerId, current_package } = result[0];

            // Update the register_dstv_status to "REGISTERED"
            const updateStatusQuery = 'UPDATE reconnect_dstv SET reconnect_dstv_status = "REACTIVATED" WHERE id = ?';
            db.query(updateStatusQuery, [id], (err, statusUpdateResult) => {
                if (err) {
                    console.error('Error executing status update query:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                if (statusUpdateResult.affectedRows > 0) {
                    // Query to get monthlyFee and service_fee from packages based on current_package
                    const feeQuery = 'SELECT monthlyFee, service_fee FROM packages';
                    db.query(feeQuery, [current_package], (err, feeResult) => {
                        if (err) {
                            console.error('Error executing fee query:', err);
                            res.status(500).send('Internal server error');
                            return;
                        }

                        if (feeResult.length > 0) {
                            // Convert monthlyFee and service_fee to numbers before adding
                            const monthlyFee = parseFloat(feeResult[0].monthlyFee);
                            const service_fee = parseFloat(feeResult[0].service_fee);
                            const totalAmount = monthlyFee + service_fee; // Sum the fees
                            const formattedAmount = `+${totalAmount}.00 SZL`; // Format the amount as a string

                            // Insert the transaction into the transactions table
                            const description = "Re-Activating DSTV";
                            const insertTransactionQuery = 'INSERT INTO transactions (customerId, description, amount, date) VALUES (?, ?, ?, ?)';
                            const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                            db.query(insertTransactionQuery, [customerId, description, formattedAmount, currentDate], (err, insertResult) => {
                                if (err) {
                                    console.error('Error executing insert query:', err);
                                    res.status(500).send('Internal server error');
                                    return;
                                }

                                res.status(200).send('Customer status updated and transaction recorded successfully');
                            });
                        } else {
                            res.status(404).send('No package found with the provided current_package');
                        }
                    });
                } else {
                    res.status(404).send('Failed to update register_dstv_status');
                }
            });
        } else {
            res.status(404).send('No customer found with the provided id');
        }
    });
});


// Define the /getRegister_tbl endpoint
app.get('/getRegister_tbl', (req, res) => {
    const selectQuery = 'SELECT * FROM register_tbl';

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        // Loop through each row to convert images to Base64
        results.forEach(row => {
            if (row.nationalIDImage instanceof Buffer) {
                row.nationalIDImage = row.nationalIDImage.toString('base64');
            }
            if (row.photoImage instanceof Buffer) {
                row.photoImage = row.photoImage.toString('base64');
            }
        });

        res.status(200).json(results);
    });
});

// Define the /deleteCustomer/:id endpoint
app.delete('/deleteCustomer/:id', (req, res) => {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM register_tbl WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error executing delete query:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.affectedRows > 0) {
            res.status(200).send('Customer deleted successfully');
        } else {
            res.status(404).send('Customer not found');
        }
    });
});



// Update role endpoint
app.put('/updateCustomerRole/:id', (req, res) => {
    const customerId = req.params.id;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ error: 'Role is required' });
    }

    const updateQuery = 'UPDATE register_tbl SET role = ? WHERE id = ?';

    db.query(updateQuery, [role, customerId], (err, result) => {
        if (err) {
            console.error('Error updating role:', err);
            return res.status(500).json({ error: 'Failed to update role' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ message: 'Role updated successfully' });
    });
});



// Endpoint to update customer's wallet balance and then update amount in details table
app.put('/updateCustomerAmount/:id', (req, res) => {
    const id = req.params.id; // The id for the customer in register_tbl
    const { walletBalance } = req.body;

    // Step 1: Update wallet balance in register_tbl
    const updateWalletSql = 'UPDATE register_tbl SET walletBalance = ? WHERE id = ?';
    db.query(updateWalletSql, [walletBalance, id], (err, result) => {
        if (err) {
            console.error('Failed to update wallet balance:', err);
            return res.status(500).json({ error: 'Failed to update wallet balance' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Step 2: Retrieve customerId based on the updated id
        const selectCustomerIdSql = 'SELECT customerId FROM register_tbl WHERE id = ?';
        db.query(selectCustomerIdSql, [id], (err2, rows) => {
            if (err2) {
                console.error('Failed to retrieve customerId:', err2);
                return res.status(500).json({ error: 'Failed to retrieve customerId' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            const customerId = rows[0].customerId; // Get the customerId from the retrieved row

            // Step 3: Update amount in details table
            const updateDetailsSql = 'UPDATE details SET amount = ? WHERE customerId = ?';
            db.query(updateDetailsSql, [walletBalance, customerId], (err3, result3) => {
                if (err3) {
                    console.error('Failed to update amount in details:', err3);
                    return res.status(500).json({ error: 'Failed to update amount in details' });
                }

                // Successfully updated both tables
                return res.status(200).json({ message: 'Wallet balance and amount updated successfully' });
            });
        });
    });
});


// Endpoint to update customer's general information (e.g., username)
app.put('/updateCustomerGeneral/:id', (req, res) => {
    const customerId = req.params.id;
    const { username } = req.body; // Adjust this to include other fields if needed

    const sql = 'UPDATE register_tbl SET username = ? WHERE id = ?';
    db.query(sql, [username, customerId], (err, result) => {
        if (err) {
            console.error('Failed to update general information:', err);
            res.status(500).json({ error: 'Failed to update general information' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Customer not found' });
        } else {
            res.status(200).json({ message: 'Customer information updated successfully' });
        }
    });
});


// Get RSA Details
app.get('/getRsaDetails/:customerId', (req, res) => {
    const { customerId } = req.params;
    console.log("RSA.........", customerId)
    db.query('SELECT * FROM tblrsadetails WHERE customerId = ?', [customerId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length > 0) {
            res.json(results[0]); // Return the first result
        } else {
            res.status(404).json({ message: 'No RSA details found' });
        }
    });
});

// Update RSA Details
app.put('/updateRsaDetails/:customerId', (req, res) => {
    const { customerId } = req.params;
    const { RsaId, RsaPhysicalAddress, RsaCellNumber, DstvAccCustNo, balanceDue, dueDate } = req.body;

    const updateQuery = `
        UPDATE tblrsadetails 
        SET RsaId = ?, RsaPhysicalAddress = ?, RsaCellNumber = ?, DstvAccCustNo = ?, balanceDue = ?, dueDate = ?
        WHERE customerId = ?`;

    db.query(updateQuery, [RsaId, RsaPhysicalAddress, RsaCellNumber, DstvAccCustNo, balanceDue, dueDate, customerId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database update error' });
        }
        if (results.affectedRows > 0) {
            res.json({ message: 'RSA details updated successfully' });
        } else {
            res.status(404).json({ message: 'No RSA details found for this customer' });
        }
    });
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
