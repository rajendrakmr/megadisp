const { getConnection } = require("../db/oracle");
const oracledb = require("oracledb"); // ✅ needed for OUT_FORMAT_OBJECT

// ================== ABT ==================
async function pullABT() {
  let conn;
  const df = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let result = {
    errorFlag: "F",
    seven: "0.00",
    eight: "0.00",
    block_no: 0,
    frequency: "0.00",
    act_sent_out: "0.00",
    gt_7: 0,
    gt_8: 0,
    st_7: 0,
    st_8: 0,
    sg_sch: "0.00",
    dc_sch: "0.00",
    total: "0.00",
    apc_7: "0.00",
    apc_8: "0.00",
    apc_total: "0.00",
    apc_7_p: "-",
    apc_8_p: "-",
    apc_total_p: "-",
    plf_7: "0.00",
    plf_8: "0.00",
    plf_stn: "0.00",
    reading_date: "",    // <- added
    reading_time: ""     // <- added
  };

  try {
    conn = await getConnection();
    const sql = `SELECT * FROM abt_flow`;

    // ✅ use the constant instead of 1
    const resultSet = await conn.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (resultSet.rows.length > 0) {
      const row = resultSet.rows[0]; // take the first row only

      const seven = row.UNIT_7 || 0;
      const eight = row.UNIT_8 || 0;
      const block_no = row.BLOCK_NO || 0;
      const frequency = row.FREQUENCY || 0;
      const act_sent_out = row.ACT_SENT_OUT || 0;
      const gt_7 = row.GT_7 || 0;
      const gt_8 = row.GT_8 || 0;
      const st_7 = row.ST_7 || 0;
      const st_8 = row.ST_8 || 0;
      const sg_sch = row.SG_SCH || 0;
      const dc_sch = row.DC_SCH || 0;

      const apc_7 = seven > 0 ? (seven - gt_7 + st_7) : 0;
      const apc_8 = eight > 0 ? (eight - gt_8 + st_8) : 0;
      const apc_total = (seven + eight) > 0 ? (seven + eight - act_sent_out) : 0;

      const apc_7_p = seven > 0 ? df.format((seven - gt_7 + st_7) * 100 / seven) : "-";
      const apc_8_p = eight > 0 ? df.format((eight - gt_8 + st_8) * 100 / eight) : "-";
      const apc_total_p = (seven + eight) > 0 ? df.format((seven + eight - act_sent_out) * 100 / (seven + eight)) : "-";

      const plf_7 = df.format(seven * 100 / 300);
      const plf_8 = df.format(eight * 100 / 250);
      const plf_stn = df.format((seven + eight) * 100 / 550);

      // ✅ Get current date/time like JSP
      const now = new Date();
      const pad = n => n.toString().padStart(2, "0");
      const insertionDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
      const insertionTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      Object.assign(result, {
        seven: df.format(seven),
        eight: df.format(eight),
        block_no,
        frequency: df.format(frequency),
        act_sent_out: df.format(act_sent_out),
        gt_7,
        gt_8,
        st_7,
        st_8,
        sg_sch: df.format(sg_sch),
        dc_sch: df.format(dc_sch),
        total: df.format(seven + eight),
        apc_7: df.format(apc_7),
        apc_8: df.format(apc_8),
        apc_total: df.format(apc_total),
        apc_7_p,
        apc_8_p,
        apc_total_p,
        plf_7,
        plf_8,
        plf_stn,
        reading_date: insertionDate,     // <- added
        reading_time: insertionTimeStr   // <- added
      });
    }
  } catch (err) {
    console.error("ABT ERROR", err);
    result.errorFlag = "T";
    result.error = err.message;
  } finally {
    if (conn) await conn.close();
  }

  return result;
}

// ================== YOKOGAWA ==================
async function pullYokogawa() {
  let conn;
  const df = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let result = {
    errorFlag: "F",
    seven: "0.00",
    eight: "0.00",
    block_no: 0,
    frequency: "0.00",
    act_sent_out: "0.00",
    sg_sch: "0.00",
    dc_sch: "0.00",
    total: "0.00",
    reading_date: "",    // <- ensure always present
    reading_time: ""
  };

  try {
    conn = await getConnection();

    const sql1 = `
      SELECT UNIT7, UNIT8, WBSETCL, FREQUENCY,
             TO_CHAR(INSERTION_TIME, 'DD-MM-YYYY') AS INSERTION_DATE,
             TO_CHAR(INSERTION_TIME, 'HH24:MI:SS') AS INSERTION_TIME
      FROM MEGAWATTDISPLAY_EXTENDED
      WHERE INSERTION_TIME = (SELECT MAX(INSERTION_TIME) FROM MEGAWATTDISPLAY_EXTENDED)
    `;
    const res1 = await conn.execute(sql1, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    let unit7 = 0, unit8 = 0, wbsetcl = 0, frequency = 0;
    let insertionDate = "", insertionTimeStr = "";

    if (res1.rows.length > 0) {
      const row = res1.rows[0];
      unit7 = row.UNIT7 || 0;
      unit8 = row.UNIT8 || 0;
      wbsetcl = row.WBSETCL || 0;
      frequency = row.FREQUENCY || 0;
      insertionDate = row.INSERTION_DATE || "";
      insertionTimeStr = row.INSERTION_TIME || "";
    }

    const sql2 = `
      SELECT BLOCK_NO, DCON
      FROM BLOCK_DATA_DC
      WHERE BLOCK_NO = (SELECT get_block_no FROM DUAL)
    `;
    const res2 = await conn.execute(sql2, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    let dc_sch = "0.00", block_no = 0;
    if (res2.rows.length > 0) {
      const row = res2.rows[0];
      block_no = row.BLOCK_NO || 0;
      dc_sch = row.DCON || "0.00";
    }

    const sql3 = `
      SELECT BLOCK_NO, SGON
      FROM BLOCK_DATA_SG
      WHERE BLOCK_NO = (SELECT get_block_no FROM DUAL)
    `;
    const res3 = await conn.execute(sql3, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    let sg_sch = "0.00";
    if (res3.rows.length > 0) {
      sg_sch = res3.rows[0].SGON || "0.00";
    }

    const totalGen = unit7 + unit8;

    Object.assign(result, {
      seven: df.format(unit7),
      eight: df.format(unit8),
      frequency: df.format(frequency),
      reading_date: insertionDate,
      reading_time: insertionTimeStr,
      total: df.format(totalGen),
      sg_sch,
      dc_sch,
      block_no,
      act_sent_out: df.format(wbsetcl)
    });

  } catch (err) {
    console.error("YOKOGAWA ERROR", err);
    result.errorFlag = "T";
    result.error = err.message;
  } finally {
    if (conn) await conn.close();
  }

  return result;
}

// ================== EXPORT BOTH ==================
module.exports = { pullABT, pullYokogawa };
