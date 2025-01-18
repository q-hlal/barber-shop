"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import {
  BsPersonFillDash,
  BsPersonFillSlash,
  BsPersonFillCheck,
  BsPersonVcardFill,
} from "react-icons/bs";
import { MdOutlineDoneOutline } from "react-icons/md";
import { TbProgressCheck, TbProgressX } from "react-icons/tb";
import { updateDoc, doc, getDocs, collection, query, where } from "firebase/firestore";
import {  db } from "@/app/firebase";
import { jwtVerify } from "jose";
import Cookies from "js-cookie";
import Link from "next/link";
import Loading from "../loding";

const Admin = () => {
  const [status, setStatus] = useState("closed");
  const [barberName, setBarberName] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [number, setNumber] = useState("");
  const [shaveType, setShaveType] = useState("full shave");
  const [customers, setCustomers] = useState([]);
  const [workTime, setWorkTime] = useState("");
  const [barberId, setBarberId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); 
  const secretKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
  const token = Cookies.get("token"); 

  const fetchData = async (name) => {
    try {
      const barberCollection = collection(db, "barber");
      const q = query(barberCollection, where("barberName", "==", name));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((docSnapshot) => {
        const { status, barberName, workTime, appointments  } = docSnapshot.data();
        setBarberId(docSnapshot.id);
        setStatus(status);
        setBarberName(barberName);
        setWorkTime(workTime);
        setCustomers(appointments || []);
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const { payload } = await jwtVerify(token, secretKey);
        const name = payload.name;
        if (name) {
          await fetchData(name);
        }
      } catch (error) {
        console.error("Error decoding token or fetching data:", error);
      }
    };
    setIsLoaded(true)

    decodeToken();
  }, [token]);

  const updateBarberInfo = async (updatedFields) => {
    if (!barberId) return;

    try {
      const barberDocRef = doc(db, "barber", barberId);
      await updateDoc(barberDocRef, updatedFields);
    } catch (error) {
      console.error("Error updating barber info: ", error);
    }
  };

  const handleAddCustomer = async () => {
    if (name && time) {
      const newCustomer = {
        customerName: name,
        time,
        shaveType,
        customerNumber: number ,
        done: false,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        }),
      };

      const updatedCustomers = [...customers, newCustomer];

      try {
        await updateBarberInfo({ appointments: updatedCustomers });
        setCustomers(updatedCustomers);
      } catch (error) {
        console.error("Error adding appointment: ", error);
      }

      setName("");
      setTime("");
      setNumber("");
      setShaveType("full shave");
    }
  };

  const handleMarkDone = async (index) => {
    const updatedCustomers = [...customers];
    updatedCustomers[index].done = !updatedCustomers[index].done;

    try {
      await updateBarberInfo({ appointments: updatedCustomers });
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Error marking customer as done: ", error);
    }
  };
  
  const deleteCustomer = async (index) => {
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا العميل؟");
      if (!confirmDelete) return;
    }
    const updatedCustomers = customers.filter((_, i) => i !== index);
    try {
      await updateBarberInfo({ appointments: updatedCustomers });
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Error deleting customer: ", error);
    }
  };
  
  

  const getStatusIcon = () => {
    switch (status) {
      case "working":
        return <BsPersonFillDash size={30} color="orange" />;
      case "aidel":
        return <BsPersonFillCheck size={30} color="green" />;
      case "closed":
        return <BsPersonFillSlash size={30} color="red" />;
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return <Loading/>
  }

  return (
    <div className={styles.admin}>
      <div className={styles.navbar}>
        <div className={styles.icon}>
          <Link
          href={{
          pathname: "/component/admin/function",
          query: { barberId: barberId },
          }}
          >
            <BsPersonVcardFill /> تعديل المعلومات
          </Link>
        </div>
        <div className={styles.info}>
          <div className={styles.bookingtime}>
              <h3> اوقات العمل : {workTime}</h3>
          </div>
          <div className={styles.name}>
              <h1> / {barberName }</h1>
          </div>
          <div className={styles.status}>
              <span>{getStatusIcon()}</span>
          </div>
        </div> 
      </div>
      <div className={styles.appointment}>
        <div className={styles.container}>
          <div className={styles.addAppointment}>
            <input
              placeholder="أدخل اسم الزبون"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="أدخل الرقم (اختياري)"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <select
              value={shaveType}
              onChange={(e) => setShaveType(e.target.value)}
            >
              <option value="full shave">حلاقه كامله للشعر</option>
              <option value="half shave">تحديد الشعر</option>
              <option value="beauty and clean">التنظيف والعنايه بالبشره</option>
              <option value="tsreh">مسرحات الشعر</option>
              <option value="vip shave">حلاقه VIP</option>
            </select>
            <button onClick={handleAddCustomer}>حفظ</button>
          </div>
          <div className={styles.showAppointment}>
            {customers.length ? (
              customers.map((customer, index) => (
                <div
                  key={index}
                  className={`${styles.card} ${
                    customer.done ? styles.doneCard : ""
                  }`}
                >
                  <div className={styles.left}>
                    <div className={styles.customerData}>
                      <div className={styles.index}>
                        تسلسل العميل : {index + 1}
                      </div>
                      <div>
                        <p>التاريخ :</p>
                        <h3>{customer.date || "no date"}</h3>
                      </div>
                      <div>
                        <p>الوقت :</p>
                        <h3>{customer.time || "no time"}</h3>
                      </div>
                      <div>
                        <p>اسم العميل :</p>
                        <h3>{customer.customerName || "no name"}</h3>
                      </div>
                      <div>
                        <p>نوع الحلاقة:</p>
                        <h3>
                          {(() => {
                            switch (customer.shaveType) {
                              case "full shave":
                                return "حلاقة كاملة للشعر";
                              case "half shave":
                                return "تحديد الشعر";
                              case "beauty and clean":
                                return "التنظيف والعناية بالبشرة";
                              case "tsreh":
                                return "مسرحات الشعر";
                              case "vip shave":
                                return "حلاقة VIP";
                              default:
                                return "غير محدد";
                            }
                          })()}
                        </h3>
                      </div>
                      <div>
                        <p>رقم العميل :</p>
                        <h3>{customer.customerNumber || "No number"}</h3>
                      </div>
                    </div>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.icons}>
                      <div
                        className={styles.done}
                        onClick={() => handleMarkDone(index)}
                      >
                        {customer.done ? (
                          <MdOutlineDoneOutline size={30} color="green" />
                        ) : (
                          <TbProgressCheck size={30} />
                        )}
                      </div>
                      <div
                        className={styles.delete}
                        onClick={() => deleteCustomer(index)}
                      >
                        <TbProgressX size={30} color="red" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.message}>
                <h2>لم يتم حجز اي موعد</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
