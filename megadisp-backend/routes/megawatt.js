// // // const express = require("express");
// // // const router = express.Router();
// // // const { pullABT, pullYokogawa } = require("../services/megawattService");
// // // const { getConnection } = require("../db/oracle");

// // // // POST route
// // // router.post("/", async (req, res) => {
// // //   let conn;
// // //   let source = "ABT"; // default if table is empty

// // //   try {
// // //     conn = await getConnection();

// // //     // 1️⃣ Query megadisp_source table
// // //     const sql = `SELECT source FROM megadisp_source`;
// // //     const resultSet = await conn.execute(sql, [], { outFormat: 1 }); // outFormat 1 = OBJECT

// // //     if (resultSet.rows.length > 0) {
// // //       source = resultSet.rows[0].SOURCE || "ABT";
// // //     }

// // //   } catch (err) {
// // //     console.error("Source fetch error:", err);
// // //     source = "ABT"; // fallback to ABT on error
// // //   } finally {
// // //     if (conn) await conn.close();
// // //   }

// // //   try {
// // //     // 2️⃣ Call appropriate service based on source
// // //     const data = source.toUpperCase() === "YOKOGAWA" 
// // //       ? await pullYokogawa() 
// // //       : await pullABT();

// // //     res.json(data);
// // //   } catch (err) {
// // //     console.error("Megawatt fetch error:", err);
// // //     res.status(500).json({ errorFlag: "T", error: err.message });
// // //   }
// // // });

// // // module.exports = router;


// // const express = require("express");
// // const router = express.Router();
// // const { pullABT, pullYokogawa } = require("../services/megawattService");
// // const { getConnection } = require("../db/oracle");

// // // POST route
// // router.post("/", async (req, res) => {
// //   let conn;
// //   let source = "ABT"; // default if table is empty

// //   try {
// //     conn = await getConnection();

// //     // 1️⃣ Query megadisp_source table
// //     const sql = `SELECT source FROM megadisp_source`;
// //     const resultSet = await conn.execute(sql, [], { outFormat: 1 }); // outFormat 1 = OBJECT

// //     if (resultSet.rows.length > 0) {
// //       source = resultSet.rows[0].SOURCE || "ABT";
// //     }

// //   } catch (err) {
// //     console.error("Source fetch error:", err);
// //     source = "ABT"; // fallback to ABT on error
// //   } finally {
// //     if (conn) await conn.close();
// //   }

// //   try {
// //     // 2️⃣ Call appropriate service based on source
// //     const data = source.toUpperCase() === "YOKOGAWA" 
// //       ? await pullYokogawa() 
// //       : await pullABT();

// //     // ✅ Attach source for frontend
// //     data.source = source;

// //     res.json(data);
// //   } catch (err) {
// //     console.error("Megawatt fetch error:", err);
// //     res.status(500).json({ errorFlag: "T", error: err.message });
// //   }
// // });

// // module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { pullABT, pullYokogawa } = require("../services/megawattService");
// const { getConnection } = require("../db/oracle");

// // POST route
// router.post("/", async (req, res) => {
//   let conn;
//   let source = "ABT"; // default if table is empty

//   try {
//     conn = await getConnection();

//     // Query megadisp_source table
//     const sql = `SELECT source FROM megadisp_source`;
//     const resultSet = await conn.execute(sql, [], { outFormat: 1 });

//     if (resultSet.rows.length > 0) {
//       source = resultSet.rows[0].SOURCE || "ABT";
//     } else {
//       // Table empty → check YOKOGAWA data
//       const checkYokogawaSQL = `
//         SELECT 1 FROM MEGAWATTDISPLAY_EXTENDED
//         WHERE ROWNUM = 1
//       `;
//       const yokogawaResult = await conn.execute(checkYokogawaSQL);
//       if (yokogawaResult.rows.length > 0) {
//         source = "YOKOGAWA"; // default to Y if ABT table empty
//       }
//     }
//   } catch (err) {
//     console.error("Source fetch error:", err);
//     source = "ABT";
//   } finally {
//     if (conn) await conn.close();
//   }

//   try {
//     const data = source.toUpperCase() === "YOKOGAWA" 
//       ? await pullYokogawa() 
//       : await pullABT();

//     // Attach source for frontend
//     data.source = source;

//     res.json(data);
//   } catch (err) {
//     console.error("Megawatt fetch error:", err);
//     res.status(500).json({ errorFlag: "T", error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const oracledb = require("oracledb"); // 🚨 ADD THIS IMPORT
const { pullABT, pullYokogawa } = require("../services/megawattService");
const { getConnection } = require("../db/oracle");

// POST route
router.post("/", async (req, res) => {
  let conn;
  let source = "ABT"; 

  try {
    conn = await getConnection();

    const sql = `SELECT source FROM megadisp_source`;
    
    // 🚨 FIX: Change '1' to 'oracledb.OUT_FORMAT_OBJECT'
    const resultSet = await conn.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (resultSet.rows.length > 0) {
      // Oracle returns keys in UPPERCASE by default
      source = resultSet.rows[0].SOURCE || "ABT";
    } else {
      const checkYokogawaSQL = `SELECT 1 FROM MEGAWATTDISPLAY_EXTENDED WHERE ROWNUM = 1`;
      const yokogawaResult = await conn.execute(checkYokogawaSQL);
      if (yokogawaResult.rows.length > 0) {
        source = "YOKOGAWA"; 
      }
    }
  } catch (err) {
    console.error("Source fetch error:", err);
    // If this error happens, it falls back to ABT. 
    // Now that we fixed outFormat, this catch won't trigger.
    source = "ABT";
  } finally {
    if (conn) await conn.close();
  }

  try {
    const data = source.toUpperCase() === "YOKOGAWA" 
      ? await pullYokogawa() 
      : await pullABT();

    // Attach the source so the frontend gets "YOKOGAWA" or "ABT"
    data.source = source;

    res.json(data);
  } catch (err) {
    console.error("Megawatt fetch error:", err);
    res.status(500).json({ errorFlag: "T", error: err.message });
  }
});

module.exports = router;