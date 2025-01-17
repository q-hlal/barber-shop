"use client";
import React, { useEffect, useState } from "react";
import styles from "./login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Loading from "../../loding";

const page = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); 
  

  const router = useRouter()

   useEffect(() => {
      setLoading(false);
    }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });
      
      const data = await response.json();
      const { isBarber, token } = data.data;
      setMessage(data.message);
      if (token) {
        Cookies.set("token", token, { expires: 24 }); 
      }
      
      if (isBarber === true) {
        router.push(`/component/admin`);
      } else if (isBarber === false) {
        router.push(`/component/user` );
      } 
      
    } catch (error) {
      setMessage("اسم المستخدم او الرمز خطا ")
      console.log(error);
    }
  };

  if (loading) {
    return <Loading/>
  }
  

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <h1>مرحبا بك مجددا 🎉😊</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
          required
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المستخدم"
            className={styles.input}
          />
          <input
          required
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز الدخول"
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            تسجيل الدخول
          </button>
        </form>
       
        <span>
            ليس لديك حساب؟ قم  {" "}
          <Link href="/component/signIn/register"> بأنشاء حساب</Link>
        </span>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default page;
