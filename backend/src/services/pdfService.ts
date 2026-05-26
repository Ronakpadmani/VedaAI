import PDFDocument from "pdfkit";
import type { QuestionPaper } from "../types";

const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
};

export function generateQuestionPaperPdf(
  paper: QuestionPaper
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text(paper.schoolName, {
      align: "center",
    });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Subject: ${paper.subject}  |  Class: ${paper.className}`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc.text(
      `Time Allowed: ${paper.timeAllowed}          Maximum Marks: ${paper.maximumMarks}`,
      { align: "center" }
    );
    doc.moveDown();
    doc.font("Helvetica-Bold").text("General Instructions:", { continued: false });
    doc.font("Helvetica").text(paper.generalInstructions);
    doc.moveDown();
    doc.text("Name: _______________________    Roll No: _______________________");
    doc.text(`Class: ${paper.className}    Section: _______________________`);
    doc.moveDown();

    for (const section of paper.sections) {
      doc.font("Helvetica-Bold").fontSize(14).text(section.title, {
        align: "center",
      });
      doc.font("Helvetica").fontSize(11).text(section.instruction, {
        align: "center",
      });
      doc.moveDown(0.5);

      for (const q of section.questions) {
        const label = difficultyLabel[q.difficulty] || q.difficulty;
        doc
          .font("Helvetica")
          .text(
            `${q.number}. [${label}] ${q.text}  [${q.marks} Marks]`,
            { indent: 20 }
          );
      }
      doc.moveDown();
    }

    doc.font("Helvetica-Bold").text("End of Question Paper", {
      align: "center",
    });
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(14).text("Answer Key");
    doc.moveDown();

    for (const a of paper.answerKey) {
      doc
        .font("Helvetica")
        .text(`${a.questionNumber}. ${a.answer}`, { indent: 20 });
    }

    doc.end();
  });
}
