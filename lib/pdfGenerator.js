import jsPDF from "jspdf";

export function generateTechDrawing(order) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const m = order.measurements || {};

      pdf.setFontSize(14);
        pdf.text("نقشه فنی قالب انگشتر - مقیاس 1:1", 20, 15);
          pdf.setFontSize(9);
            pdf.text(`شماره سفارش: ${order.id}`, 20, 21);
              pdf.text("توجه: این برگه رو با مقیاس 100% (بدون Fit to page) چاپ کنید.", 20, 26);

                if (m.outerDiameter) {
                    const r = m.outerDiameter / 2;
                        pdf.circle(70, 80, r, "S");
                          }
                            if (m.innerDiameter) {
                                const r = m.innerDiameter / 2;
                                    pdf.circle(70, 80, r, "S");
                                      }

                                        let y = 130;
                                          pdf.setFontSize(11);
                                            pdf.text("مشخصات:", 20, y); y += 6;
                                              const rows = [
                                                  ["قطر بیرونی", m.outerDiameter],
                                                      ["قطر داخلی (سایز انگشتر)", m.innerDiameter],
                                                          ["عرض بند", m.bandWidth],
                                                              ["ضخامت فلز", m.bandThickness],
                                                                  ["ارتفاع نگین/طرح", m.stoneHeight],
                                                                    ];
                                                                      rows.forEach(([label, val]) => {
                                                                          if (val) { pdf.text(`${label}: ${val} mm`, 20, y); y += 6; }
                                                                            });

                                                                              return pdf;
                                                                              }
                                                                              
