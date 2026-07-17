import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadOrderPhoto, updateOrder } from "../../lib/firestoreHelpers";

const SHOTS = [
  { key: "top", title: "۱. از بالا (روی میز، تخت)", desc: "انگشتر رو صاف روی میز بذار، مرجع اندازه (سکه/خط‌کش) رو دقیقاً کنارش و هم‌سطحش بذار. از بالا و عمود عکس بگیر." },
    { key: "side", title: "۲. از پهلو (ایستاده)", desc: "انگشتر رو سرپا (مثل حلقه) بذار، مرجع اندازه رو کنارش، از روبه‌رو عکس بگیر تا عرض و ارتفاع بند دیده بشه." },
      { key: "inner", title: "۳. نمای داخلی/برش بند", desc: "اگه می‌تونی از مقطع بند (ضخامت فلز) نزدیک عکس بگیر، مرجع اندازه رو کنارش بذار." },
        { key: "detail", title: "۴. نمای نزدیک نگین/طرح", desc: "اگه نگین یا طرح خاصی داره، از نزدیک با مرجع اندازه عکس بگیر." },
        ];

        export default function NewOrder() {
          const router = useRouter();
            const { id } = router.query;
              const { user } = useAuth();
                const [photos, setPhotos] = useState({});
                  const [uploading, setUploading] = useState(false);
                    const [ringType, setRingType] = useState("plain");

                      const handleFile = async (key, file) => {
                          if (!file || !id) return;
                              setUploading(true);
                                  const url = await uploadOrderPhoto(id, file, key);
                                      setPhotos(p => ({ ...p, [key]: url }));
                                          setUploading(false);
                                            };

                                              const finish = async () => {
                                                  const photoArr = Object.entries(photos).map(([label, url]) => ({ label, url }));
                                                      if (photoArr.length < 2) {
                                                            alert("حداقل عکس شماره ۱ و ۲ (از بالا و از پهلو) لازمه.");
                                                                  return;
                                                                      }
                                                                          await updateOrder(id, { photos: photoArr, ringType, status: "photos_uploaded" });
                                                                              router.push(`/measure/${id}`);
                                                                                };

                                                                                  if (!user || !id) return null;

                                                                                    return (
                                                                                        <div className="container">
                                                                                              <h2 style={{ marginTop: 20 }}>ثبت عکس‌های انگشتر</h2>
                                                                                                    <div className="card">
                                                                                                            <b>یادت نره:</b> توی هر عکس، یه مرجع اندازه‌ی شناخته‌شده (سکه یا خط‌کش) کنار انگشتر باشه. بدون این، اپ نمی‌تونه اندازه واقعی بده.
                                                                                                                  </div>
                                                                                                                  
                                                                                                                        <div className="card">
                                                                                                                                <label>نوع انگشتر</label>
                                                                                                                                        <select value={ringType} onChange={e => setRingType(e.target.value)}>
                                                                                                                                                  <option value="plain">ساده (بدون نگین)</option>
                                                                                                                                                            <option value="stoned">با نگین/سنگ</option>
                                                                                                                                                                      <option value="carved">طرح‌دار / حکاکی‌شده</option>
                                                                                                                                                                              </select>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    
                                                                                                                                                                                          {SHOTS.map(s => (
                                                                                                                                                                                                  <div className="card" key={s.key}>
                                                                                                                                                                                                            <b>{s.title}</b>
                                                                                                                                                                                                                      <p style={{ color: "#9aa4b8", fontSize: 14 }}>{s.desc}</p>
                                                                                                                                                                                                                                <input type="file" accept="image/*" capture="environment"
                                                                                                                                                                                                                                            onChange={e => handleFile(s.key, e.target.files[0])} />
                                                                                                                                                                                                                                                      {photos[s.key] && <img src={photos[s.key]} style={{ width: "100%", marginTop: 8, borderRadius: 8 }} />}
                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                    ))}
                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                          <button className="btn" style={{ width: "100%" }} disabled={uploading} onClick={finish}>
                                                                                                                                                                                                                                                                                  {uploading ? "در حال آپلود..." : "ادامه به مرحله اندازه‌گیری"}
                                                                                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                              
