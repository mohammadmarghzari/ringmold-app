import {
  doc, getDoc, setDoc, updateDoc, increment, serverTimestamp,
  collection, addDoc, query, where, orderBy, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_RATE_PER_MINUTE = 500; // تومان به ازای هر دقیقه استفاده - از پنل ادمین قابل تغییره

export async function ensureUserProfile(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      walletBalance: 0,
      createdAt: serverTimestamp(),
    });
  }
}

export function subscribeWallet(uid, cb) {
  return onSnapshot(doc(db, "users", uid), (snap) => cb(snap.exists() ? snap.data() : { walletBalance: 0 }));
}

export async function requestCharge(uid, userEmail, amount) {
  await addDoc(collection(db, "chargeRequests"), {
    uid, userEmail, amount,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function subscribeUserChargeRequests(uid, cb) {
  const q = query(collection(db, "chargeRequests"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeAllChargeRequests(cb) {
  const q = query(collection(db, "chargeRequests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function approveCharge(requestId, uid, amount) {
  await updateDoc(doc(db, "chargeRequests", requestId), { status: "approved", resolvedAt: serverTimestamp() });
  await updateDoc(doc(db, "users", uid), { walletBalance: increment(amount) });
  await addDoc(collection(db, "walletTransactions"), {
    uid, amount, type: "charge", createdAt: serverTimestamp(),
  });
}

export async function rejectCharge(requestId) {
  await updateDoc(doc(db, "chargeRequests", requestId), { status: "rejected", resolvedAt: serverTimestamp() });
}

export function subscribeWalletTransactions(uid, cb) {
  const q = query(collection(db, "walletTransactions"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function getRatePerMinute() {
  const snap = await getDoc(doc(db, "settings", "billing"));
  return snap.exists() ? snap.data().ratePerMinute : DEFAULT_RATE_PER_MINUTE;
}

export function subscribeSettings(cb) {
  return onSnapshot(doc(db, "settings", "billing"), (snap) => {
    cb(snap.exists() ? snap.data() : { ratePerMinute: DEFAULT_RATE_PER_MINUTE });
  });
}

export async function updateRatePerMinute(rate) {
  await setDoc(doc(db, "settings", "billing"), { ratePerMinute: rate }, { merge: true });
}

// هزینه‌ی استفاده از ابزار اندازه‌گیری رو از کیف پول کسر می‌کنه و تراکنش رو ثبت می‌کنه.
// اگه موجودی کافی نباشه، false برمی‌گردونه (بدون کسر هزینه).
export async function chargeForUsage(uid, orderId, durationMs) {
  const rate = await getRatePerMinute();
  const minutes = durationMs / 60000;
  const cost = Math.ceil(minutes * rate);
  if (cost <= 0) return { ok: true, cost: 0 };

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const balance = snap.exists() ? snap.data().walletBalance || 0 : 0;

  if (balance < cost) {
    return { ok: false, cost, balance };
  }

  await updateDoc(userRef, { walletBalance: increment(-cost) });
  await addDoc(collection(db, "walletTransactions"), {
    uid, orderId, amount: -cost, type: "usage",
    durationMs, ratePerMinute: rate,
    createdAt: serverTimestamp(),
  });
  return { ok: true, cost, balance: balance - cost };
}
