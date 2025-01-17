"use client";
import styles from "./function.module.css";
import { useState, useEffect } from "react";
import { updateDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { MdDeleteSweep } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { TfiCut } from "react-icons/tfi";
import Loading from "../../loding";

const EditPage = () => {
  const [status, setStatus] = useState("closed");
  const [workTime, setWorkTime] = useState("");
  const [location, setLocation] = useState("");
  const [number, setNumber] = useState("");
  const [shaveInfo, setShaveInfo] = useState([]);
  const [newShave, setNewShave] = useState({ shave: "", time: "", price: "" });
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const barberId = searchParams.get("barberId");

  useEffect(() => {
    const fetchBarberInfo = async () => {
      if (!barberId) return;

      try {
        const barberDocRef = doc(db, "barber", barberId);
        const barberDoc = await getDoc(barberDocRef);

        if (barberDoc.exists()) {
          const data = barberDoc.data();
          setStatus(data.status || "closed");
          setWorkTime(data.workTime || "");
          setLocation(data.location || "");
          setNumber(data.number || "");
          setShaveInfo(data.shaveInfo || []);
        }
      } catch (error) {
        console.error("Error fetching barber info: ", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchBarberInfo();
  }, [barberId]);

  const updateBarberInfo = async (updatedFields) => {
    if (!barberId) return;

    try {
      const barberDocRef = doc(db, "barber", barberId);
      await updateDoc(barberDocRef, updatedFields);
      console.log("Barber info updated successfully!");
      setMessage("تم حفظ التغييرات بنجاح!");
    } catch (error) {
      console.error("Error updating barber info: ", error);
      setMessage("حدث خطأ أثناء حفظ التغييرات.");
    }
  };

  const saveChanges = () => {
    if (!location || !workTime || !number) {
      setMessage("يجب ملء جميع الحقول لحفظ التغييرات!");
      return;
    }

    updateBarberInfo({
      location: location.trim() || "لم يحدد الموقع بعد",
      workTime: workTime || "لم يحدد الوقت بعد",
      number,
      status,
      shaveInfo,
    });
  };

  const addShaveInfo = () => {
    const { shave, time, price } = newShave;

    if (shave && time && price) {
      const parsedPrice = parseFloat(price);

      if (isNaN(parsedPrice)) {
        console.error("Price must be a valid number!");
        setMessage("السعر يجب أن يكون رقماً صالحاً!");
        return;
      }

      const updatedShaveInfo = [...shaveInfo, { shave, time, price: parsedPrice }];
      setShaveInfo(updatedShaveInfo);

      updateBarberInfo({
        shaveInfo: updatedShaveInfo,
      });

      setNewShave({ shave: "", time: "", price: "" });
      setMessage("تمت إضافة الحلاقة بنجاح!");
    } else {
      console.error("All fields are required to add shave info!");
      setMessage("يجب ملء جميع الحقول لإضافة نوع الحلاقة!");
    }
  };

  const clear = async () => {
    if (typeof window !== "undefined") {
      const confirmClear = window.confirm("هل أنت متأكد أنك تريد حذف الحساب؟");
      if (!confirmClear) return; 
    }
    try {
      const barberDocRef = doc(db, "barber", barberId);
      await deleteDoc(barberDocRef);
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
      setMessage("تمت إعادة التعيين بنجاح!"); 
      router.push("/component/signIn/register");
    } catch (error) {
      console.error("Error clearing records:", error);
      setMessage("حدث خطأ أثناء إعادة التعيين."); 
    }
  };
  

  const signOut = async () => {
    if (typeof window !== "undefined") {
      const confirmSignOut = window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");
      if (!confirmSignOut) return;
    } 
    try {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
      setMessage("تم تسجيل الخروج بنجاح!");
      router.push("/component/signIn/login");
    } catch (error) {
      console.error("Error during sign out:", error); 
      setMessage("حدث خطأ أثناء تسجيل الخروج.");
    }
  };
  

  const handleDelete = (indexToDelete) => {
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا النوع من الحلاقة؟");
      if (!confirmDelete) return; 
    } 
    const updatedShaveInfo = shaveInfo.filter((_, index) => index !== indexToDelete);
    setShaveInfo(updatedShaveInfo);
    updateBarberInfo({
      shaveInfo: updatedShaveInfo,
    });
    setMessage("تمت إزالة نوع الحلاقة بنجاح!");
  };
  

  if (!isLoaded) {
    return <Loading/>;
  }

  return (
    <div className={styles.info}>
      <div className={styles.container}>
        <div className={styles.finshButton}>
          <button onClick={clear}>حذف السجل</button>
          <button onClick={signOut}>تسجيل خروج</button>
        </div>

        <div className={styles.input}>
          <div className={styles.location}>
            <input
              placeholder="ادخل الموقع"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className={styles.bookingtime}>
            <input
              placeholder="ادخل اوقات العمل"
              value={workTime}
              onChange={(e) => setWorkTime(e.target.value)}
            />
          </div>
          <div className={styles.number}>
            <input
              placeholder="ادخل رقم الهاتف"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div className={styles.status}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="closed">مغلق</option>
              <option value="aidel">في انتظار الزبون التالي</option>
              <option value="working">يعمل</option>
            </select>
          </div>
        </div>

        <div className={styles.shaveinfo}>
          <h3>
            <TfiCut />
          </h3>
          <input
            placeholder=" اسم الحلاقه (مثال :تحديد الشعر)"
            value={newShave.shave}
            onChange={(e) => setNewShave((prev) => ({ ...prev, shave: e.target.value }))}
          />
          <input
            placeholder="وقت الحلاقة (مثال: 30 - 45 )"
            value={newShave.time}
            onChange={(e) => setNewShave((prev) => ({ ...prev, time: e.target.value }))}
          />
          <input
            type="number"
            placeholder="سعر الحلاقة"
            value={newShave.price}
            onChange={(e) => setNewShave((prev) => ({ ...prev, price: e.target.value }))}
          />
          <button onClick={addShaveInfo}>إضافة</button>
        </div>

        <div className={styles.saveButton}>
          <button onClick={saveChanges}>حفظ التغييرات</button>
        </div>
        <p className={styles.message}>{message}</p>
      </div>

      <div className={styles.shaveList}>
        {shaveInfo.map((info, index) => (
          <div key={index} className={styles.shaveItem}>
            <h4>النوع: {info.shave}</h4>
            <div>
              <button onClick={() => handleDelete(index)}>
                <MdDeleteSweep />
              </button>
              <div className={styles.cardInfo}>
                <p>الوقت: {info.time} دقيقة</p>
                <p>السعر: {info.price} دينار</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditPage;
