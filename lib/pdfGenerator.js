import jsPDF from "jspdf";

export function generateTechDrawing(order) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const m = order.design || {};
    const outerDiameter = m.innerDiameter && m.bandThickness ? m.innerDiameter + m.bandThickness * 2 : null;

      pdf.setFontSize(14);
        pdf.text("نقشه فنی قالب انگشتر - مقیاس 1:1", 20, 15);
          pdf.setFontSize(9);
            pdf.text(`شماره سفارش: ${order.id}`, 20, 21);
              pdf.text("توجه: این برگه رو با مقیاس 100% (بدون Fit to page) چاپ کنید.", 20, 26);

                if (outerDiameter) {
                    pdf.circle(70, 80, outerDiameter / 2, "S");
                          }
                            if (m.innerDiameter) {
                                pdf.circle(70, 80, m.innerDiameter / 2, "S");
                                      }

                                        let y = 130;
                                          pdf.setFontSize(11);
                                            pdf.text("مشخصات:", 20, y); y += 6;
                                              const rows = [
                                                  ["قطر بیرونی", outerDiameter],
                                                      ["قطر داخلی (سایز انگشتر)", m.innerDiameter],
                                                          ["عرض بند", m.bandWidth],
                                                              ["ضخامت فلز", m.bandThickness],
                                                                  ["عرض روکار", m.topWidth],
                                                                      ["ارتفاع روکار", m.topHeight],
                                                                          ["اندازه‌ی نگین", m.stoneSize],
                                                                    ];
                                                                      rows.forEach(([label, val]) => {
                                                                          if (val) { pdf.text(`${label}: ${val} mm`, 20, y); y += 6; }
                                                                            });

                                                                              if (order.notes) {
                                                                                  y += 4;
                                                                                  pdf.setFontSize(11);
                                                                                  pdf.text("توضیح طرح دلخواه:", 20, y); y += 6;
                                                                                  pdf.setFontSize(9);
                                                                                  const lines = pdf.splitTextToSize(order.notes, 170);
                                                                                  pdf.text(lines, 20, y);
                                                                              }

                                                                              return pdf;
                                                                              }
