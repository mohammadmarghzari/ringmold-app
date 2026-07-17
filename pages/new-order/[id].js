import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadReferenceImage, updateOrder } from "../../lib/firestoreHelpers";
import { chargeForUsage, getRatePerMinute } from "../../lib/walletHelpers";

const TOP_SHAPES = [
  { value: "none", label: "بدون روکار (بند ساده)" },
  { value: "round-dome", label: "گنبدی گرد" },
  { value: "oval-dome", label: "بیضی" },
  { value: "square-signet", label: "چهارگوش (مثل انگشتر مردانه/عقیق)" },
];

export default function NewOrder() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [innerDiameter, setInnerDiameter] = useState(18);
  const [bandWidth, setBandWidth] = useState(5);
  const [bandThickness, setBandThickness] = useState(1.5);
  const [ringType, setRingType] = useState("plain");
  const [topShape, setTopShape] = useState("none");
  const [topWidth, setTopWidth] = useState(8);
  const [topHeight, setTopHeight] = useState(3);
  const [hasStone, setHasStone] = useState(false);
  const [stoneShape, setStoneShape] = useState("round");
  const [stoneSize, setStoneSize] = useState(4);
  const [engraveText, setEngraveText] = useState("");
  const [notes, setNotes] = useState("");
  const [refImage, setRefImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [rate, setRate] = useState(500);
  const [saving, setSaving] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    getRatePerMinute().then(setRate);
  }, []);

  const handleRefImage = async (file) => {
    if (!file || !id) return;
    setUploadingImage(true);
    const url = await uploadReferenceImage(id, file);
    setRefImage(url);
    setUploadingImage(false);
  };

  const submit = async () => {
    if (!innerDiameter || !bandWidth || !bandThickness) {
      alert("سایز انگشت، عرض بند و ضخامت فلز رو پر کن.");
      return;
    }
    setSaving(true);
    const durationMs = Date.now() - startTimeRef.current;
    const result = await chargeForUsage(user.uid, id, durationMs);
    if (!result.ok) {
      setSaving(false);
      alert(`موجودی کیف پول کافی نیست. هزینه‌ی این طراحی ${result.cost.toLocaleString("fa-IR")} تومانه ولی موجودیت ${result.balance.toLocaleString("fa-IR")} تومانه. اول کیف پولت رو شارژ کن.`);
      router.push("/wallet");
      return;
    }

    const design = {
      innerDiameter: Number(innerDiameter),
      bandWidth: Number(bandWidth),
      bandThickness: Number(bandThickness),
      topShape,
      topWidth: topShape !== "none" ? Number(topWidth) : 0,
      topHeight: topShape !== "none" ? Number(topHeight) : 0,
      hasStone: topShape !== "none" && hasStone,
      stoneShape,
      stoneSize: hasStone ? Number(stoneSize) : 0,
      engraveText: engraveText.trim(),
    };

    await updateOrder(id, {
      design,
      ringType,
      notes: notes.trim(),
      refImage: refImage || null,
      status: "designed",
    });
    router.push(`/result/${id}`);
  };

  if (!id || !user) return null;

  return (
    <div className="container">
      <h2 style={{ marginTop: 20 }}>طراحی انگشتر</h2>

      <div className="card">
        <b>این مرحله چطور کار می‌کنه؟</b>
        <p style={{ fontSize: 13, color: "#9aa4b8", marginTop: 6, lineHeight: 2 }}>
          به‌جای گرفتن عکس، خودت سایز انگشتت و مشخصات طرح رو وارد کن. از روی همین اطلاعات، یه مدل سه‌بعدی دقیق و قابل‌چاپ می‌سازیم. اگه طرح دلخواهت پیچیده‌تر از گزینه‌های زیره، توی کادر توضیحات کامل بنویسش — همراه عکس‌های سفارش برای قالب‌ساز فرستاده می‌شه.
        </p>
      </div>

      <div className="card">
        <b>۱. سایز انگشت و بند</b>
        <label style={{ marginTop: 10 }}>سایز انگشت / قطر داخلی انگشتر (mm)</label>
        <input type="number" value={innerDiameter} onChange={(e) => setInnerDiameter(e.target.value)} />
        <label style={{ marginTop: 10 }}>عرض بند (mm)</label>
        <input type="number" value={bandWidth} onChange={(e) => setBandWidth(e.target.value)} />
        <label style={{ marginTop: 10 }}>ضخامت فلز بند (mm)</label>
        <input type="number" value={bandThickness} onChange={(e) => setBandThickness(e.target.value)} />
      </div>

      <div className="card">
        <b>۲. نوع و روکار</b>
        <label style={{ marginTop: 10 }}>نوع انگشتر</label>
        <select value={ringType} onChange={(e) => setRingType(e.target.value)}>
          <option value="plain">ساده (بدون نگین)</option>
          <option value="stoned">با نگین/سنگ</option>
          <option value="carved">طرح‌دار / حکاکی‌شده</option>
        </select>

        <label style={{ marginTop: 10 }}>شکل روکار</label>
        <select value={topShape} onChange={(e) => setTopShape(e.target.value)}>
          {TOP_SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {topShape !== "none" && (
          <>
            <label style={{ marginTop: 10 }}>عرض روکار (mm)</label>
            <input type="number" value={topWidth} onChange={(e) => setTopWidth(e.target.value)} />
            <label style={{ marginTop: 10 }}>ارتفاع روکار از سطح بند (mm)</label>
            <input type="number" value={topHeight} onChange={(e) => setTopHeight(e.target.value)} />

            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="hasStone" checked={hasStone} onChange={(e) => setHasStone(e.target.checked)} style={{ width: "auto" }} />
              <label htmlFor="hasStone" style={{ marginTop: 0 }}>نگین داره</label>
            </div>
            {hasStone && (
              <>
                <label style={{ marginTop: 10 }}>شکل نگین</label>
                <select value={stoneShape} onChange={(e) => setStoneShape(e.target.value)}>
                  <option value="round">گرد</option>
                  <option value="square">چهارگوش</option>
                </select>
                <label style={{ marginTop: 10 }}>اندازه‌ی نگین (mm)</label>
                <input type="number" value={stoneSize} onChange={(e) => setStoneSize(e.target.value)} />
              </>
            )}

            {topShape === "square-signet" && (
              <>
                <label style={{ marginTop: 10 }}>حکاکی روی روکار (فقط حروف/عدد انگلیسی، اختیاری)</label>
                <input type="text" maxLength={8} value={engraveText} onChange={(e) => setEngraveText(e.target.value)} placeholder="مثلاً M.A" />
              </>
            )}
          </>
        )}
      </div>

      <div className="card">
        <b>۳. توضیح کامل طرح دلخواه</b>
        <p style={{ fontSize: 13, color: "#9aa4b8" }}>هرچی که گزینه‌های بالا پوشش نمی‌ده رو اینجا با جزئیات بنویس (مثلاً شکل دقیق حکاکی، الگوی حاشیه، رنگ نگین). این متن مستقیم برای قالب‌ساز فرستاده می‌شه.</p>
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلاً: انگشتر مردونه با روکار مثلثی‌شکل، حاشیه‌ی حکاکی‌شده با طرح گل و بوته، نگین مشکی مربعی وسط..." />
      </div>

      <div className="card">
        <b>۴. عکس مرجع (اختیاری)</b>
        <p style={{ fontSize: 13, color: "#9aa4b8" }}>اگه عکسی از طرح مورد نظرت (یا خود انگشتر فعلیت) داری، برای الهام قالب‌ساز آپلود کن.</p>
        <input type="file" accept="image/*" onChange={(e) => handleRefImage(e.target.files[0])} />
        {uploadingImage && <p style={{ fontSize: 13, color: "#9aa4b8" }}>در حال آپلود...</p>}
        {refImage && <img src={refImage} style={{ width: "100%", marginTop: 8, borderRadius: 8 }} />}
      </div>

      <p style={{ fontSize: 12, color: "#8a93a8", textAlign: "center" }}>
        هزینه‌ی استفاده از این ابزار، بر اساس مدت زمانی که صرف می‌کنی ({rate.toLocaleString("fa-IR")} تومان/دقیقه)، موقع ثبت از کیف پولت کسر می‌شه.
      </p>
      <button className="btn" style={{ width: "100%" }} disabled={saving || uploadingImage} onClick={submit}>
        {saving ? "در حال ثبت..." : "ثبت طرح و ساخت مدل سه‌بعدی"}
      </button>
    </div>
  );
}
