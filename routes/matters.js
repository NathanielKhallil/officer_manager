const express = require("express");
const router = express.Router();
const models = require("../app/models");

const Excel = require("exceljs");
require("dotenv").config();

// // excel options
// const options = {
//   filename: "../excel-matterlist.xlsx",
//   useStyles: true,
//   useSharedStrings: true,
// };

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet("Matters List");

// clears the worksheet of duplicate rows by splicing away rows prior to new workbook writing
function deleteRows(rows) {
  let i = rows.length;
  while (i >= 1) {
    worksheet.spliceRows(i, 1);
    i--;
  }
}

router.get("/", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const admin = req.user.is_admin;
    const matters = await models.Matters.findAll({
      order: [["matter_number"]],
    });
    return res.render("matters", { matters: matters, admin: admin });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

// create excel file
router.get("/generate", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const matters = await models.Matters.findAll({
      order: [["matter_number"]],
    });

    // Clear previous row data in the worksheet
    if (worksheet) {
      deleteRows(matters);
    }

    // Set column info
    worksheet.columns = [
      { header: "Matter Num:", key: "matter_num", width: 20 },
      { header: "CFA signed:", key: "cfa_signed", width: 18 },
      {
        header: "Statement of Claim Filed:",
        key: "statement_of_claim_filed",
        width: 31,
      },
      { header: "S of C served:", key: "s_of_c_served", width: 21 },
      { header: "S of D served:", key: "s_of_d_served", width: 21 },
      { header: "Aff of Recs Served", key: "aff_of_recs_served", width: 25 },
      { header: "Producibles Sent", key: "producibles_sent", width: 25 },
      {
        header: "Undertakings Left",
        key: "undertakings_remaining",
        width: 28,
      },
      { header: "Notes", key: "notes", width: 41 },
      { header: "createdAt", key: "createdAt", width: 17 },
      { header: "updatedAt", key: "updatedAt", width: 17 },
    ];

    // Add row using key mapping to columns

    for (let i = 0; i < matters.length; i++) {
      worksheet.addRow({
        matter_num: matters[i].matter_number,
        cfa_signed: matters[i].cfa_signed,
        statement_of_claim_filed: matters[i].statement_of_claim_filed,
        s_of_c_served: matters[i].s_of_c_served,
        s_of_d_served: matters[i].s_of_d_served,
        aff_of_recs_served: matters[i].aff_of_recs_served,
        producibles_sent: matters[i].producibles_sent,
        undertakings_remaining: matters[i].undertakings_remaining,
        notes: matters[i].notes,
        createdAt: matters[i].createdAt,
        updatedAt: matters[i].updatedAt,
      });
    }

    worksheet.autoFilter = "A1:K1";

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
      row.eachCell(function (cell, colNumber) {
        if (rowNumber === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "33ccff" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
          cell.font = {
            name: "Arial",
            family: 2,
            bold: true,
            size: 12,
          };
        }
        if (rowNumber > 1) {
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
          };
        }
        if (cell.value === false && rowNumber > 1) {
          cell.fill = {
            type: "gradient",
            gradient: "angle",
            degree: 0,
            stops: [
              { position: 0, color: { argb: "ffffff" } },
              { position: 0.5, color: { argb: "4d4d4d" } },
              { position: 1, color: { argb: "000000" } },
            ],
          };
        }
        if (cell.value < 1 && rowNumber > 1 && colNumber === 8) {
          cell.fill = {
            type: "gradient",
            gradient: "angle",
            degree: 0,
            stops: [
              { position: 0, color: { argb: "ffffff" } },
              { position: 0.5, color: { argb: "99ff99" } },
              { position: 1, color: { argb: "4dff4d" } },
            ],
          };
        }

        if (
          cell.value > 1 &&
          cell.value < 9 &&
          rowNumber > 1 &&
          colNumber === 8
        ) {
          cell.fill = {
            type: "gradient",
            gradient: "angle",
            degree: 0,
            stops: [
              { position: 0, color: { argb: "ffffff" } },
              { position: 0.5, color: { argb: "ffdb4d" } },
              { position: 1, color: { argb: "ffcc00" } },
            ],
          };
        }

        if (
          cell.value > 8 &&
          cell.value <= 13 &&
          rowNumber > 1 &&
          colNumber === 8
        ) {
          cell.fill = {
            type: "gradient",
            gradient: "angle",
            degree: 0,
            stops: [
              { position: 0, color: { argb: "ffffff" } },
              { position: 0.5, color: { argb: "ffa366" } },
              { position: 1, color: { argb: "ff6600" } },
            ],
          };
        }

        if (cell.value >= 14 && rowNumber > 1 && colNumber === 8) {
          cell.fill = {
            type: "gradient",
            gradient: "angle",
            degree: 0,
            stops: [
              { position: 0, color: { argb: "ffffff" } },
              { position: 0.5, color: { argb: "ff6666" } },
              { position: 1, color: { argb: "ff0000" } },
            ],
          };
        }
      });
    });

    // User can download the workfile and rename as desired.

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "matterlist.xlsx"
    );
    await workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

//create new matter
router.post("/", async (req, res) => {
  const matterNum = await req.body.matterNum;
  const notes = await req.body.notes;
  const matterExists = await models.Matters.findOne({
    where: { matter_number: matterNum },
  });
  if (matterExists) {
    return res.send("Matter number already exists.");
  } else {
    try {
      let newMatter = {
        matter_number: matterNum,
        notes: notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await models.Matters.create(newMatter).then(function () {
        return res.redirect("/matters");
      });
    } catch {
      res.redirect("/matters");
    }
  }
});

// update matters

router.post("/update/:id", async (req, res) => {
  try {
    let updatedCFA = req.body.cfa_signed;
    let updatedStatementOfClaimFiled = req.body.statement_of_claim_filed;
    let updatedStatementOfClaimServed = req.body.s_of_c_served;
    let updatedStatementOfDefenceServed = req.body.s_of_d_served;
    let updatedAffOfRecords = req.body.aff_of_recs_served;
    let updatedProduciblesSent = req.body.producibles_sent;
    let updatedQuestioningDone = req.body.questioning_done;
    let updatedUndertakingsRemaining = req.body.undertakings_remaining;
    let updatedNotes = req.body.notes;

    await models.Matters.update(
      {
        id: req.params.id,
        cfa_signed: updatedCFA,
        statement_of_claim_filed: updatedStatementOfClaimFiled,
        s_of_c_served: updatedStatementOfClaimServed,
        s_of_d_served: updatedStatementOfDefenceServed,
        aff_of_recs_served: updatedAffOfRecords,
        producibles_sent: updatedProduciblesSent,
        questioning_done: updatedQuestioningDone,
        undertakings_remaining: updatedUndertakingsRemaining,
        notes: updatedNotes,
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    ).then(function () {
      res.redirect("/matters");
    });
  } catch (e) {
    res.send(e);
  }
});

// delete matters

router.post("/delete/:id", async (req, res) => {
  if (req.user && req.user.is_admin === true) {
    try {
      await models.Matters.destroy({ where: { id: req.params.id } }).then(
        function () {
          res.redirect("/matters");
        }
      );
    } catch {
      res.send("Failed to delete matter.");
    }
  } else {
    res.send("You must be an Administrator to delete matters.");
  }
});

module.exports = router;
