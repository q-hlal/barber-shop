import { auth, db } from '@/app/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json(); 

    const { name, password, isBarber, isCustomer } = body;

    if (!body || !name || !password) {
      return NextResponse.json({ message: 'إدخال غير صالح. يرجى تقديم اسم وكلمة مرور صالحين.' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ message: 'يجب أن تكون كلمة المرور مكونة من 4 أرقام أو أكثر.' }, { status: 400 });
    }

    if (isCustomer) {
      const customerDocRef = doc(db, 'customer', name);

      await setDoc(customerDocRef, {
        customerName: name,
        password: password,
        isCustomer: true,
        appointment: {}
      });

      return NextResponse.json({ message: 'تم التسجيل بنجاح!' }, { status: 201 });
    }

    if (isBarber) {
      const barberDocRef = doc(db, 'barber', name);
      const docSnap = await getDoc(barberDocRef);

      if (docSnap.exists()) {
        console.log('Barber already exists');
        return NextResponse.json({ message: 'يوجد بالفعل سجل بهذا الاسم.' }, { status: 409 });
      }

      await setDoc(barberDocRef, {
        barberName: name,
        password: password,
        number: 'لم يتم تحديد رقم الهاتف بعد',
        isBarber: true,
        status: 'مغلق',
        workTime: 'لم يتم تحديد الوقت بعد',
        location: 'لم يتم تحديد الموقع بعد',
        appointments: [],
        shaveInfo: []
      });

      return NextResponse.json({ message: 'تم التسجيل بنجاح!' }, { status: 201 });
    }

    return NextResponse.json({ message: 'اختيار دور غير صالح.' }, { status: 400 });
  } catch (error) {
    console.error('خطأ أثناء التسجيل:', error);
    return NextResponse.json({ message: 'حدث خطأ داخلي.' }, { status: 500 });
  }
}
