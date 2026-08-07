require('dotenv').config();

const express = require("express");
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            messsage:'Access token required'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }
    next();
}

app.use(express.json());
app.use(express.static("public"));

app.post('/register', async (req, res) => {
    console.log('REGISTER REQUEST RECEIVED');
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)`;

    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Failed', err);

            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'Email already exists'
                });
            }
                return res.status(500).json({
                    message: 'Failed to register user'
                });
        }
        
        console.log('INSERT RESULT:', result);

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    });

});

app.post('/login', async (req, res) => {
    console.log('Login Request Received');

    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.log('Login failed: ', err);
            return res.status(500).json({
                message: 'Login failed'
            });
        }
        if (results.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }
        // res.json({
        //     message: 'Login successful',
        //     user: {
        //         id: user.id,
        //         name: user.name,
        //         email: user.email,
        //         role: user.role
        //     }
        // });
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );
        
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

app.get('/users', (req, res) => {
    console.log('GET USERS REQUEST RECEIVED');

    const sql = `SELECT id, name, email, role
    FROM users
    ORDER BY id DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.log('Failed to get users:', err);

            return res.status(500).json({
                message: 'Failed to get users'
            });
        }
        console.log('USERS RESULT:', results);
        res.json({
            users: results
        });
    });
});

app.post('/incidents', authenticateToken, (req, res) => {
    console.log('CREATE INCIDENT REQUEST RECEIVED');

    const { title, description } = req.body;
    const user_id = req.user.id;

    if (!title || !description) {
        return res.status(400).json({
            message: 'User ID, title and description is required'
        });
    }

    const sql = `INSERT INTO incidents (user_id, title, description)
    VALUES (?, ?, ?)`;

    db.query(sql, [user_id, title, description], (err, result) => {
        if (err) {
            console.error('Failed to create incident', err);

            return res.status(500).json({
                message:'Failed to create incident'
            });
        }

        console.log('INCIDENT INSERT RESULT');

        res.status(201).json({
            message: 'Incident created successfully',
            incidentId: result.insertId
        });
    });
});

app.get('/incidents', authenticateToken, (req, res) => {
    console.log('GET INCIDENTS RECEIVED');

    console.log('req', req.user);
    const user_id = req.user.id;

    const sql = `SELECT
    incidents.id,
    incidents.user_id,
    users.name AS user_name,
    incidents.title,
    incidents.description,
    incidents.status,
    incidents.created_at
    FROM incidents
    JOIN users ON incidents.user_id = users.id
    WHERE incidents.user_id = ?
    ORDER BY incidents.id DESC`;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Failed to get incidents:', err);

            return res.status(500).json({
                message: 'Failed to get incidents'
            });
        }

        console.log('INCIDENTS RESULTS', results);

        res.json({
            incidents: results
        });
    });
});

app.get('/admin/incidents', authenticateToken, checkAdmin, (req, res) => {
    console.log('GET ALL INCIDENTS RECEIVED');

    console.log('req', req.user);
    const user_id = req.user.id;

    const sql = `SELECT
    incidents.id,
    incidents.user_id,
    users.name AS user_name,
    incidents.title,
    incidents.description,
    incidents.status,
    incidents.created_at
    FROM incidents
    JOIN users ON incidents.user_id = users.id
    ORDER BY incidents.id DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Failed to get incidents:', err);

            return res.status(500).json({
                message: 'Failed to get incidents'
            });
        }

        console.log('INCIDENTS RESULTS', results);

        res.json({
            incidents: results
        });
    });
});

app.put('/admin/incidents/:id', authenticateToken, checkAdmin, (req, res) => {
    console.log("UPDATE INCIDENT REQUEST RECEIVED");

    const incidentId = req.params.id;
    const {status} = req.body;

    if (!status) {
        return res.status(400).json({
            message: 'Status is required'
        });
    }
    
    const sql = `UPDATE incidents
    SET STATUS = ?
    WHERE id = ?`;

    db.query(sql, [status, incidentId], (err, result) => {
        if (err) {
            console.log('Failed to update incident', err);

            return res.status(500).json({
                message: 'Failed to update incident'
            });
        }
        
        if (result.affectedRows === 0){
            return res.status(404).json({
                message: 'Incident not found'
            });
        }

        res.json({
            message: 'Incident status updated successfully.'
        });
    });
});


// old version
// app.get('/incidents', authenticateToken, (req, res) => {
//     console.log('GET INCIDENTS RECEIVED');

//     const sql = `SELECT
//     incidents.id,
//     incidents.user_id,
//     users.name AS user_name,
//     incidents.title,
//     incidents.description,
//     incidents.status,
//     incidents.created_at
//     FROM incidents
//     JOIN users ON incidents.user_id = users.id
//     ORDER BY incidents.id DESC`;

//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error('Failed to get incidents:', err);

//             return res.status(500).json({
//                 message: 'Failed to get incidents'
//             });
//         }

//         console.log('INCIDENTS RESULTS', results);

//         res.json({
//             incidents: results
//         });
//     });
// });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        return;
    }

    console.log('Connected to MySQL');
});

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});