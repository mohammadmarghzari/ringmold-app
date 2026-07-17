import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export async function createOrder(userId, userEmail) {
  const docRef = await addDoc(collection(db, "orders"), {
      userId, userEmail,
          status: "new",
              photos: [],
                  measurements: {},
                      ringType: "plain",
                          createdAt: serverTimestamp(),
                            });
                              return docRef.id;
                              }

                              export async function uploadOrderPhoto(orderId, file, label) {
                                const folder = `orders/${orderId}`;
                                const signRes = await fetch("/api/cloudinary-sign", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ folder }),
                                });
                                const { signature, timestamp, apiKey, cloudName } = await signRes.json();

                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("api_key", apiKey);
                                formData.append("timestamp", timestamp);
                                formData.append("signature", signature);
                                formData.append("folder", folder);

                                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                  method: "POST",
                                  body: formData,
                                });
                                const data = await uploadRes.json();
                                return data.secure_url;
                                }

                                    export async function updateOrder(orderId, data) {
                                      await updateDoc(doc(db, "orders", orderId), data);
                                      }

                                      export function subscribeUserOrders(userId, cb) {
                                        const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
                                          return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                                          }

                                          export function subscribeAllOrders(cb) {
                                            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                                              return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                                              }
                                              
