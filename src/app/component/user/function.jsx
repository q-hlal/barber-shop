import { Calendar } from "react-date-range";
import { useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import styles from "./user.module.css";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/app/firebase";
import Image from "next/image";

export const RenderForm = ({ toggleForm, barberId  }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [shaveType, setShaveType] = useState("full shave");
  const [message, setMessage] = useState(""); 
  const [showSuccess , setShowSuccess] =useState(false)
  const [successDetails, setSuccessDetails] = useState(null);


  const handleDateChange = (date) => setDate(date);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const appointmentDetails = {
      date: date.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
      time,
      shaveType,
      customerName: customerName.trim(),
      customerNumber: customerNumber.trim(),
      done: false,
    };
  
    if (!barberId) {
      setMessage("الرجاء اختيار حلاق لإضافة موعد");
      return;
    }
  
    const barberDocRef = doc(db, "barber", barberId);
    const customerDocRef = doc(db, "customer", customerName.trim());
  
    try {
      const customerDocSnap = await getDoc(customerDocRef);
      if (!customerDocSnap.exists()) {
        setMessage("يجب أن يتطابق الاسم الحالي مع اسم حسابك");
        return;
      }
  
      const customerData = customerDocSnap.data();
      if (customerData.appointment && Object.keys(customerData.appointment).length > 0) {
        setMessage("لديك موعد بالفعل");
        return;
      }
  
      const barberDocSnap = await getDoc(barberDocRef);
      if (barberDocSnap.exists()) {
        const { appointments = [] } = barberDocSnap.data();
  
        const isDuplicate = appointments.some(
          (appointment) =>
            appointment.date === appointmentDetails.date &&
            appointment.time === appointmentDetails.time
        );
  
        if (isDuplicate) {
          setMessage("تم حجز هذا الموعد بالفعل، الرجاء اختيار موعد آخر");
          return;
        }
  
        await updateDoc(barberDocRef, {
          appointments: arrayUnion({ ...appointmentDetails, customerName }),
        });
      } else {
        await setDoc(barberDocRef, {
          appointments: [{ ...appointmentDetails, customerName }],
        });
      }
  
      await updateDoc(customerDocRef, {
        appointment: {
          barberName: barberId,
          date: appointmentDetails.date,
          time: appointmentDetails.time,
          shaveType: appointmentDetails.shaveType,
        },
      });
  
      setMessage("تم إضافة موعد");
      setSuccessDetails({ ...appointmentDetails });
      setShowSuccess(true);
    } catch (error) {
      console.error("Error adding appointment: ", error);
      setMessage("حدث خطأ أثناء إضافة الموعد. الرجاء المحاولة مرة أخرى.");
    }
  };
  
  
  return (
    <div className={styles.addform}>
      {!showSuccess ? (
        <>
          <form onSubmit={handleSubmit}>
            <Calendar date={date} onChange={handleDateChange} />
            <input
              placeholder="أسم ألعميل"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="رقم العميل (اختياري)"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <select value={shaveType} onChange={(e) => setShaveType(e.target.value)}>
              <option value="full shave">حلاقه كامله للشعر</option>
              <option value="half shave">تحديد الشعر</option>
              <option value="beauty and clean">التنظيف والعناية بالبشرة</option>
              <option value="tsreh">مسرح شعر</option>
              <option value="vip shave">حلاقه VIP</option>
            </select>
            <div className={styles.buttons}>
              <button type="submit">تأكيد الموعد</button>
              <button type="button" onClick={() => toggleForm(false)}>
                الغاء الموعد
              </button>
            </div>
          </form>
          {message && <p className={styles.message}>{message}</p>}
        </>
      ) : (
        <div className={styles.successMessage}>
        <Image
          src="/img/date.png"
          alt="Success Icon"
          width={150} 
          height={150}
        />
        <div className={styles.text}>
          <p>تم إضافة الموعد بنجاح </p>
          <h3>{successDetails.time} و بوقت {successDetails.date} بتأريخ  </h3>
          <p>شكراً لاختيارك لنا !</p>
        </div>
        <button onClick={() => toggleForm(false)}>تم</button>
      </div>
      
      )}
    </div>
  );
};