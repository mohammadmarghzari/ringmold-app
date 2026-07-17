import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { generateTechDrawing } from "../../lib/pdfGenerator";
import { exportRingSTL } from "../../lib/ringMold";

const RingViewer = dynamic(() => import("../../components/RingViewer"), { ssr: false });
const MATERIAL_GUIDE = {
    plain: {
          title: "انگشتر ساده",
          steps: [
                  "مدل مستر با موم ریخته گری ساخته بشه.",
                  "روش موم گمشده با گچ سرامیکی مناسبه.",
                  "دقت پرینت حداقل 50 میکرون توصیه می شه.",
                ],
        },
    stoned: {
          title: "انگشتر با نگین",
          steps: [
                  "مدل مستر با رزین کم خاکستر پرینت بشه.",
                  "نگین بعد از ریخته گری نصب بشه.",
                ],
        },
    carved: {
          title: "انگشتر طرح دار",
          steps: [
                  "رزولوشن پرینت حداقل 25 میکرون باشه.",
                  "از رزین مخصوص جواهرسازی استفاده بشه.",
                ],
        },
  };

export default function Result() {
    const router = useRouter();
    const { id } = router.query;
    const [order, setOrder] = useState(null);

    useEffect(() => {
          if (!id) return;
          getDoc(doc(db, "orders", id)).then(snap => setOrder({ id: snap.id, ...snap.data() }));
        }, [id]);

    if (!order) return null;
    const guide = MATERIAL_GUIDE[order.ringType] || MATERIAL_GUIDE.plain;

    const downloadPDF = () => {
          const pdf = generateTechDrawing(order);
          pdf.save(`ring-mold-${order.id}.pdf`);
        };

    const downloadSTL = () => {
          const blob = exportRingSTL(order.measurements || {}, order.ringType);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ring-mold-${order.id}.stl`;
          a.click();
          URL.revokeObjectURL(url);
        };

    return (
          <div className="container">
            <h2 style={{ marginTop: 20 }}>نتیجه نهایی</h2>

            <div className="card">
              <b>ابعاد نهایی</b>
              <table style={{ marginTop: 10 }}>
                <tbody>
                  {Object.entries(order.measurements || {}).map(([k, v]) => (
                                  <tr key={k}><td>{k}</td><td>{v} mm</td></tr>
                                ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <b>مدل سه‌بعدی قالب</b>
              <p style={{ fontSize: 13, color: "#9aa4b8", marginBottom: 10 }}>
                این مدل از روی اندازه‌های ثبت‌شده ساخته شده. با موس/انگشت می‌تونی بچرخونیش. فایل STL رو می‌تونی مستقیم به قالب‌ساز یا پرینتر سه‌بعدی بدی تا مدل مستر رو براش بسازه.
              </p>
              {order.measurements && <RingViewer measurements={order.measurements} ringType={order.ringType} />}
              <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={downloadSTL}>
                دانلود فایل STL (برای قالب‌ساز/پرینتر سه‌بعدی)
              </button>
            </div>

            <div className="card">
              <b>راهنمای متریال - {guide.title}</b>
              <ul>
                {guide.steps.map((s, i) => <li key={i} style={{ fontSize: 14, marginBottom: 6 }}>{s}</li>)}
              </ul>
            </div>

            <button className="btn" style={{ width: "100%" }} onClick={downloadPDF}>
              دانلود نقشه فنی PDF
            </button>

            <p style={{ fontSize: 12, color: "#8a93a8", marginTop: 8 }}>
              این PDF رو با مقیاس 100% چاپ کن، بعد بده به قالب ساز.
            </p>
          </div>
        );
  }
