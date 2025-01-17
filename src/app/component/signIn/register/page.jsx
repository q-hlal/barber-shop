'use client';
import React, { useState, useEffect } from 'react';
import styles from './register.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from '../../loding';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    isCustomer: false,
    isBarber: false,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSelection = (selection) => {
    setFormData({
      ...formData,
      isCustomer: selection === 'isCustomer',
      isBarber: selection === 'isBarber',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.status === 201) {
        setMessage(data.message);
        setTimeout(() => {
          router.push("/component/signIn/login");
        }, 1500);
      } else {
        setMessage(data.message);
      }
      setFormData({ name: '', password: '', isBarber: false, isCustomer: false });
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("حدث خطا اثناء عمليه الدخول , يرجى المحاوله لاحقا.");
    }
  };
  

  if (loading) {
    return <Loading/>
  }

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <h1> اهلا بك 👋😊 </h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder=" اسم المستخدم"
            className={styles.input}
          />
          <input
            required
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder=" رمز الدخول"
            className={styles.input}
          />

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isCustomer"
                checked={formData.isCustomer}
                onChange={() => handleSelection('isCustomer')}
                className={styles.checkbox}
              />
              <Image src="/img/customer.png" width={100} height={100} alt="Customer" />
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isBarber"
                checked={formData.isBarber}
                onChange={() => handleSelection('isBarber')}
                className={styles.checkbox}
              />
              <Image src="/img/barber.png" width={100} height={100} alt="Barber" />
            </label>
          </div>

          <div className={styles.checkboxText}>
          <p> يرجى تذكر استخدام اسم جيد، ويفضل أن يكون الاسم مميز عند الاختيار، لا يمكنك تغيير نوع الاختيار او الاسم لاحقًا. شكرًا لك </p>
          </div>
          <button type="submit" className={styles.button}>
            تسجيل الدخول
          </button>
        </form>
        <span>
          لديك حساب بالفعل؟ قم{" "}
          <Link href="/component/signIn/login"> بتسجيل الدخول</Link>
        </span>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default Register;
