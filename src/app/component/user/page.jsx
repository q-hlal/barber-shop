"use client";
import Image from "next/image";
import styles from "./user.module.css";
import { useState, useEffect } from "react";
import { RenderForm } from "./function";
import { getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import Cookies from "js-cookie";
import { jwtVerify } from "jose";
import { BsArrowUpLeft } from "react-icons/bs";
import Link from "next/link";
import { RiDeleteBin2Fill } from "react-icons/ri";
import Loading from "../loding";

const Custmer = () => {
  const [showForm, setShowForm] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [userName, setUserName] = useState("");
  const [appointment, setAppointment] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); 
  const secretKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
  const token = Cookies.get("token");

  useEffect(() => {
    const decodeToken = async () => {
      try {
        const { payload } = await jwtVerify(token, secretKey);
        const name = payload.name;
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error("Error decoding token or fetching data:", error);
      }
    };

    decodeToken();
  }, [token]);

  useEffect(() => {
    const fetchCustomer = async () => {
      const customerCollection = collection(db, "customer");
      const querySnapshot = await getDocs(customerCollection);

      querySnapshot.forEach((doc) => {
        if (doc.data().customerName === userName) {
          setAppointment(doc.data().appointment);
        }
      });

      setIsLoaded(true); 
    };

    fetchCustomer();
  }, [userName]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barberCollection = collection(db, "barber");
        const barberSnapshot = await getDocs(barberCollection);
        const barberData = barberSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBarbers(barberData);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      }
    };

    fetchBarbers();
  }, []);

  useEffect(() => {
    if (filterInput.trim() === "") {
      setFilteredBarbers(barbers);
    } else {
      const filtered = barbers.filter((barber) =>
        barber.barberName?.toLowerCase().includes(filterInput.toLowerCase())
      );
      setFilteredBarbers(filtered);
    }
  }, [filterInput, barbers]);

  const toggleForm = () => setShowForm((prev) => !prev);

  const handleBarberClick = (barber) => {
    setSelectedBarber(barber);
  };

  const handleDeleteAppointment = async () => {
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm("هل انت متأكد من حذف هذا الموعد؟");
      if (!confirmDelete) return;
    } 
    try {
      const customerCollection = collection(db, "customer");
      const querySnapshot = await getDocs(customerCollection);
  
      querySnapshot.forEach(async (doc) => {
        if (doc.data().customerName === userName) {
          const customerDoc = doc.ref;
          await updateDoc(customerDoc, {
            appointment: null,
          });
          setAppointment(null);
        }
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };
  

  if (!isLoaded) {
    return <Loading/>
  }
  return (
    <div className={styles.user}>
      <div className={styles.navbar}>
        <div className={styles.info}>
          <span>
            <Image
              alt="applogoimg"
              src="/img/moustache.gif"
              width={50}
              height={50}
            />
          </span>
        </div>
        <div className={styles.button}>
          <input
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            placeholder="ابحث عن  حلاقك المفضل"
          />
          <Image
            width={50}
            height={50}
            alt="img"
            src="/img/appointment.png"
            onClick={toggleForm}
            className={styles.appointmentImg}
          />
        </div>
      </div>
      <div className={styles.customerInfo}>
        <div className={styles.username}>
          <h3>طاب يومك , {userName}</h3>
          {appointment ? (
            <p>نتمنى لك يوما سعيدا , لا تنسى موعدك</p>
          ) : (
            <p>سارع بالحجز لموعدك التالي</p>
          )}
        </div>
        <div className={styles.myappointment}>
          {appointment ? (
            <div className={styles.myappointmentcard}>
              <button onClick={handleDeleteAppointment}>
                <RiDeleteBin2Fill />
              </button>
              <div>
                <h4>
                  اسم الحلاق: {appointment.barberName} ـــــ النوع:{" "}
                  {(() => {
                    switch (appointment.shaveType) {
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
                </h4>
                <p>
                  {appointment.date} ــــــ {appointment.time}
                </p>
              </div>
            </div>
          ) : (
            <h3>لا يوجد موعد</h3>
          )}
        </div>
      </div>
      <div className={styles.container}>
      <div className={styles.barberInfo}>
          {filteredBarbers.length === 0 ? (
            barbers.length === 0 ? (
              <p className={styles.notefound}>لا يوجد حلاقين حاليا !</p>
            ) : (
              <p className={styles.notefound}>لا يوجد حلاق بهذه الاسم !</p>
            )
          ) : (
            <>
              <div className={styles.barbercard}>
                {filteredBarbers.slice(0, 4).map((barber) => (
                  <div
                    key={barber.id}
                    className={styles.barberName}
                    style={{
                      border:
                        selectedBarber?.id === barber.id ? "1px solid #0056b3" : "",
                      background:
                        selectedBarber?.id === barber.id
                          ? "rgba(0, 86, 179, 0.1)"
                          : "",
                    }}
                  >
                    <div className={styles.icons}>
                      <div
                        style={{
                          color:
                            selectedBarber?.id === barber.id ? "#0056b3" : "",
                          border:
                            selectedBarber?.id === barber.id
                              ? "1px solid #0056b3"
                              : "",
                        }}
                        className={styles.imageWrapper}
                        onClick={() => handleBarberClick(barber)}
                      >
                        {barber.barberName?.charAt(0).toUpperCase()}
                      </div>
                      <Link
                        href={`/component/user/${barber.id}?workTime=${barber.workTime}&status=${barber.status}&location=${barber.location}&name=${barber.barberName}&number=${barber.number}&shaveInfo=${JSON.stringify(
                          barber.shaveInfo
                        )}`}
                      >
                        <div className={styles.arrowIcon}>
                          <BsArrowUpLeft />
                        </div>
                      </Link>
                    </div>
                    <h3>
                      اسم الحلاق: <span>{barber.barberName}</span>
                    </h3>
                  </div>
                ))}
              </div>
                <Link
                  href={{
                    pathname: "/component/user/barbers",
                    query: { Barbers: JSON.stringify(barbers) },
                  }}
                >
                  المزيد ...
                </Link>
            </>
          )}
        </div>
        <div className={styles.detail}>
          {selectedBarber ? (
            <div className={styles.infoCard}>
              <h2>مواعيد اليوم:</h2>
              <div className={styles.cardData}>
                {selectedBarber.appointments?.length > 0 ? (
                  selectedBarber.appointments.some(
                    (appointment) =>
                      appointment.date ===
                      new Date().toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                      })
                  ) ? (
                    selectedBarber.appointments
                      .filter(
                        (appointment) =>
                          appointment.date ===
                          new Date().toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                          })
                      )
                      .map((appointment, index) => (
                        <div key={index} className={styles.barberAppointment}>
                          <div>
                            <h3>اسم العميل: {appointment.customerName}</h3>
                          </div>
                          <div>
                            <p>التاريخ: {appointment.date}</p>
                            <p>الوقت: {appointment.time}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p>لا توجد مواعيد لهذا اليوم، كن أولهم</p>
                  )
                ) : (
                  <p>لا توجد مواعيد لهذا اليوم، كن أولهم</p>
                )}
              </div>
            </div>
          ) : (
            <h2>اختر أيقونة اسم الحلاق لعرض التفاصيل</h2>
          )}
        </div>
      </div>
      {showForm && (
        <div className={styles.modalOverlay}>
          <div>
            <RenderForm toggleForm={toggleForm} barberId={selectedBarber?.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Custmer;
