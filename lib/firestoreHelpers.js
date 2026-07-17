import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

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
                                const fileRef = ref(storage, `orders/${orderId}/${label}_${Date.now()}.jpg`);
                                  await uploadBytes(fileRef, file);
                                    return await getDownloadURL(fileRef);
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
                                              
