import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { message: "الاسم وكلمة المرور مطلوبان." },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET; 
    if (!secret) {
      throw new Error("متغير البيئة JWT_SECRET غير مُعين.");
    }

    const barberCollection = collection(db, "barber");
    const barberQuery = query(
      barberCollection,
      where("barberName", "==", name),
      where("password", "==", password)
    );
    const barberSnapshot = await getDocs(barberQuery);

    if (!barberSnapshot.empty) {

      const token = jwt.sign({ name, role: "barber" }, secret);

      return NextResponse.json({
        message: "تسجيل الدخول ناجح",
        data: { isBarber: true, token },
      });
    }

    const customerCollection = collection(db, "customer");
    const customerQuery = query(
      customerCollection,
      where("customerName", "==", name),
      where("password", "==", password)
    );
    const customerSnapshot = await getDocs(customerQuery);

    if (!customerSnapshot.empty) {
      const token = jwt.sign({ name, role: "customer" }, secret);

      return NextResponse.json({
        message: "تسجيل الدخول ناجح",
        data: { isBarber: false, token },
      });
    }

    return NextResponse.json(
      { message: "اسم المستخدم أو كلمة المرور غير صحيحة." },
      { status: 401 }
    );
  } catch (error) {
    console.error("خطأ أثناء تسجيل الدخول:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تسجيل الدخول." },
      { status: 500 }
    );
  }
}
