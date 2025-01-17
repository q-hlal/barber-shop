"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./barbers.module.css";
import { BsArrowUpLeft } from "react-icons/bs";
import Link from "next/link";


const BarbersPage = () => {
  const searchParams = useSearchParams();
  const [barbers, setBarbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const decodedBarbers = searchParams.get("Barbers");

  useEffect(() => {
    if (decodedBarbers) {
      try {
        const parsedBarbers = JSON.parse(decodedBarbers);
        setBarbers(parsedBarbers);
      } catch (error) {
        console.error("Error parsing barber data:", error);
      }
    }
  }, [decodedBarbers]);

  const filteredBarbers = barbers.filter((barber) =>
    barber.barberName.toLowerCase().includes(searchTerm.toLowerCase()) 
  );
  return (
    <div className={styles.container}>
     <h1 className={styles.pageTitle}> جميع الحلاقين 🌟</h1>

      <input
        className={styles.searchInput}
        placeholder="ابحث عن حلاقك المفضل"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className={styles.cardContainer}>
        {Array.isArray(filteredBarbers) && filteredBarbers.length > 0 ? (
          filteredBarbers.map((barber) => (
            <div className={styles.card} key={barber.id}>
              <div className={styles.cardHeader}>
                <h3 className={styles.barberName}>{barber.barberName}</h3>
                <p
                style={{
                  color:
                    barber.status === "closed"
                      ? "#d32f2f"
                      : barber.status === "aidel"
                      ? "#388e3c"
                      : barber.status === "working"
                      ? "#f9a825"
                      : "#757575",
                }}
              >
                {barber.status === "closed"
                  ? "مغلق حاليا"
                  : barber.status === "aidel"
                  ? " متاح للزبون التالي"
                  : barber.status === "working"
                  ? "يعمل حاليا"
                  : "غير معروف"}
              </p>
              </div>
              <div className={styles.cardBody}>
                <Link  href={`/component/user/${barber.id}?workTime=${barber.workTime}&status=${barber.status}&location=${barber.location}&name=${barber.barberName}&number=${barber.number}&shaveInfo=${JSON.stringify(barber.shaveInfo)}`}><BsArrowUpLeft/></Link>
                <div className={styles.info}>
                  <p className={styles.detail}><strong>اوقات العمل:</strong> {barber.workTime}</p>
                  <p className={styles.detail}><strong>الموقع:</strong> {barber.location}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noBarbers}>لا يوجد حلاق بهذه الاسم.</p>
        )}
      </div>
    </div>
  );
};

export default BarbersPage;
