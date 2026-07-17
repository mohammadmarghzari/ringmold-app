import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { generateTechDrawing } from "../../lib/pdfGenerator";
import { exportRingSTL } from "../../lib/ringMold";
import { useAuth } from "../../context/AuthContext";
import { subscribeWallet } from "../../lib/walletHelpers";
import Layout from "../../components/Layout";

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
const FIELD_LABELS = {
  innerDiameter: "قطر داخلی (سایز انگشت)",
  bandWidth: "عرض بند",
  bandThickness: "ضخامت فلز بند",
  topWidth: "عرض روکار",
  topHeight: "ارتفاع روکار",
  stoneSize: "اندازه‌ی نگین",
};

export default function Result() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [wallet, setWallet] = useState({ walletBalance: 0 });

    useEffect(() => {
          if (!id) return;
          getDoc(doc(db, "orders", id)).then(snap => setOrder({ id: snap.id, ...snap.data() }));
        }, [id]);

    useEffect(() => {
          if (!user) return;
          return subscribeWallet(user.uid, setWallet);
        }, [user]);

    if (!order) return null;
    const guide = MATERIAL_GUIDE[order.ringType] || MATERIAL_GUIDE.plain;
    const design = order.design || {};

    const downloadPDF = () => {
          const pdf = generateTechDrawing(order);
          pdf.save(`ring-mold-${order.id}.pdf`);
        };

    const downloadSTL = async () => {
          setExporting(true);
          const blob = await exportRingSTL(design);
          setExporting(false);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ring-mold-${order.id}.stl`;
          a.click();
          URL.revokeObjectURL(url);
        };

    return (
          <Layout wallet={wallet.walletBalance || 0}>
            <h2 style={{ marginTop: 20 }}>نتیجه نهایی</h2>

            <div className="card">
              <b>مشخصات طرح</b>
              <table style={{ marginTop: 10 }}>
                <tbody>
                  {Object.entries(FIELD_LABELS).map(([k, label]) => (
                    design[k] ? <tr key={k}><td>{label}</td><td>{design[k]} mm</td></tr> : null
                                ))}
                </tbody>
              </table>
            </div>

            {order.notes && (
              <div className="card">
                <b>توضیح طرح دلخواه (برای قالب‌ساز)</b>
                <p style={{ fontSize: 14, marginTop: 8, whiteSpace: "pre-wrap" }}>{order.notes}</p>
              </div>
            )}

            {order.refImage && (
              <div className="card">
                <b>عکس مرجع</b>
                <img src={order.refImage} style={{ width: "100%", marginTop: 8, borderRadius: 8 }} />
              </div>
            )}

            <div className="card">
              <b>مدل سه‌بعدی قالب</b>
              <p style={{ fontSize: 13, color: "#9aa4b8", marginBottom: 10 }}>
                این مدل از روی مشخصات ثبت‌شده ساخته شده. با موس/انگشت می‌تونی بچرخونیش. فایل STL رو می‌تونی مستقیم به قالب‌ساز یا پرینتر سه‌بعدی بدی تا مدل مستر رو براش بسازه.
              </p>
              <RingViewer design={design} />
              <button className="btn" style={{ width: "100%", marginTop: 10 }} disabled={exporting} onClick={downloadSTL}>
                {exporting ? "در حال آماده‌سازی..." : "دانلود فایل STL (برای قالب‌ساز/پرینتر سه‌بعدی)"}
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
          </Layout>
        );
  }
