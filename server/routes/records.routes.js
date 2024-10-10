const router = require("express").Router();
const pool = require("../db/sdg.db.js");

router.post("/records-values", async (req, res) => {
    try {
        const { question_id, selectedYear, selectedSdg, user_id } = req.body;

        if (!selectedYear || !selectedSdg || !question_id) {
            return res.status(400).json({
                message: "Question ID, Year, and SDG must be provided",
            });
        }

        // Query to get record values based on question_id, selectedYear, and selectedSdg
        const result = await pool.query(
            `SELECT rv.*
             FROM records_values rv
             INNER JOIN records r ON rv.record_id = r.record_id
             WHERE rv.question_id = $1 AND r.sdg_id = $2 AND EXTRACT(YEAR FROM r.date_submitted) = $3 AND r.user_id = $4`,
            [question_id, selectedSdg, selectedYear, user_id]
        );

        // Check if values were found
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "No values found for the given criteria" });
        }

        // Format the response data before sending
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/records-values/check", async (req, res) => {
    try {
        const { selectedYear, selectedSdg, user_id } = req.body;

        if (!selectedYear || !selectedSdg || !user_id) {
            return res.status(400).json({
                message: "Year, SDG, and User ID must be provided",
            });
        }

        // Query to get record values based on user_id, selectedYear, and selectedSdg
        const result = await pool.query(
            `SELECT r.record_id
             FROM records r
             WHERE r.sdg_id = $1 AND EXTRACT(YEAR FROM r.date_submitted) = $2 AND r.user_id = $3`,
            [selectedSdg, selectedYear, user_id]
        );

        // Check if a record was found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No records found" });
        }

        // Return the record_id
        res.json({ record_id: result.rows[0].record_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/add/records", async (req, res) => {
    try {
        const { user_id, status, sdg_id, year } = req.body;

        console.log(req.body);

        // Default status to 'To be reviewed' if not provided
        const recordStatus = status || 1;

        // Generate a unique record ID REC + 1000000 to 9999999
        const record_id = `REC${Math.floor(Math.random() * 9000000) + 1000000}`;

        // Insert the new record into the database
        const newRecord = await pool.query(
            "INSERT INTO records (record_id, user_id, status, date_submitted, sdg_id, year) VALUES ($1, $2, $3, current_timestamp, $4, $5) RETURNING *",
            [record_id, user_id, recordStatus, sdg_id, year]
        );

        res.status(201).json(newRecord.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/add/answers", async (req, res) => {
    const { record_value_id, value, question_id, record_id, campus_id } =
        req.body;

    try {
        // Check if all required fields are provided
        if (
            !record_value_id ||
            !value ||
            !question_id ||
            !record_id ||
            !campus_id
        ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Insert data into the table
        const query = `
            INSERT INTO records_values (record_value_id, value, question_id, record_id, campus_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            record_value_id,
            value,
            question_id,
            record_id,
            campus_id,
        ];
        const result = await pool.query(query, values);
        console.log(result);
        // Return the inserted row
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/answers/:record_id", async (req, res) => {
    const { record_id } = req.params;

    try {
        // Check if required parameters are provided
        if (!record_id) {
            return res
                .status(400)
                .json({ error: "All query parameters are required" });
        }

        // Fetch data from the table
        const query = `
          SELECT rv.record_value_id, rv.value, rv.question_id, rv.record_id, rv.campus_id, q.sub_id
FROM public.records_values rv
INNER JOIN public.question q ON rv.question_id = q.question_id
WHERE rv.record_id = $1;
        `;
        const values = [record_id];
        const result = await pool.query(query, values);

        // Return the fetched rows
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route: GET /api/get/record/:year/:sdg
router.get("/get/record/:year/:sdg", async (req, res) => {
    const { year, sdg } = req.params;

    try {
        // Replace with your actual query to fetch record based on year and SDG
        const record = await pool.query(
            "SELECT * FROM records WHERE year = $1 AND sdg_id = $2",

            [year, sdg]
        );

        if (record.rows.length > 0) {
            res.json(record.rows[0]); // Return the first record if multiple records exist
        } else {
            res.status(404).json({ message: "No record found" });
        }
    } catch (error) {
        console.error("Error fetching record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/recordbysdoffice/:year/:sdg/:user_id", async (req, res) => {
    const { year, sdg, user_id } = req.params;

    try {
        // Replace with your actual query to fetch record based on year and SDG
        const record = await pool.query(
            "SELECT * FROM records WHERE year = $1 AND sdg_id = $2 AND user_id=$3",

            [year, sdg, user_id]
        );

        if (record.rows.length > 0) {
            res.json(record.rows[0]); // Return the first record if multiple records exist
        } else {
            res.status(404).json({ message: "No record found" });
        }
    } catch (error) {
        console.error("Error fetching record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/record-values", async (req, res) => {
    try {
        // Query to join records_values with question and select required columns
        const result = await pool.query(`
            SELECT rv.record_value_id, rv.value, rv.question_id, rv.record_id, rv.campus_id, q.sub_id, r.sdg_id
            FROM records_values rv
            JOIN question q ON rv.question_id = q.question_id
            JOIN records r ON rv.record_id = r.record_id
        `);

        // Send the result as JSON
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching record values:", error);
        res.status(500).send("Server error");
    }
});

// PATCH route to update the status of a record
router.patch("/update/status", async (req, res) => {
    const { record_id, status } = req.body; // Get the new status from the request body

    try {
        // Check if the status is provided
        if (!status) {
            return res.status(400).json({ message: "Status must be provided" });
        }

        // Update the status in the records table
        const result = await pool.query(
            `UPDATE records
             SET status = $1
             WHERE record_id = $2
             RETURNING *;`,
            [status, record_id]
        );

        // Check if the record was found and updated
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Return the updated record
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating record status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//
router.put("/update/answers", async (req, res) => {
    const { record_value_id, value } = req.body;

    try {
        const query = `
            UPDATE records_values
            SET value = $1
            WHERE record_value_id = $2
            RETURNING *;
        `;
        const values = [value, record_value_id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Define the route
router.get("/get/records-values", async (req, res) => {
    try {
        // SQL query
        const query = `
SELECT 
    rv.*,             -- Fetch all columns from records_values
    q.sub_id,         -- Fetch sub_id from question table
    r.date_submitted, -- Fetch date_submitted from records table
    i.sdg_id,          -- Fetch sdg_id from instrument table
    s.section_id
FROM 
    public.records_values rv
JOIN 
    public.records r ON rv.record_id = r.record_id
JOIN 
    public.question q ON rv.question_id = q.question_id
JOIN 
    public.section s ON q.section_id = s.section_id  -- Join section table
JOIN 
    public.instrument i ON s.instrument_id = i.instrument_id;  -- Join instrument table to get sdg_id

        `;

        // Execute the query using the pool
        const result = await pool.query(query);

        // Send the result back as JSON
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching records values:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get/records-values-by-sdg_id/", async (req, res) => {
    try {
        // SQL query
        console.log(req.params.sdg_id);
        // const sdg_id = req.params.sdg_id;
        const query = `
SELECT 
    rv.*,             -- Fetch all columns from records_values
    q.sub_id,         -- Fetch sub_id from question table
    r.date_submitted, -- Fetch date_submitted from records table
    i.sdg_id,          -- Fetch sdg_id from instrument table
    s.section_id
FROM 
    public.records_values rv
JOIN 
    public.records r ON rv.record_id = r.record_id
JOIN 
    public.question q ON rv.question_id = q.question_id
JOIN 
    public.section s ON q.section_id = s.section_id  -- Join section table
JOIN 
    public.instrument i ON s.instrument_id = i.instrument_id where r.status = 3;  -- Join instrument table to get sdg_id

        `;

        // Execute the query using the pool
        const result = await pool.query(query);
        // Send the result back as JSON
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching records values:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
