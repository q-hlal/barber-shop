'use client';
import { useSearchParams } from 'next/navigation';
import styles from './id.module.css';
import { IoPersonCircleSharp , IoTimeOutline , IoLocationOutline , IoTimerOutline} from "react-icons/io5";
import { FaPhoneFlip , FaMoneyCheckDollar } from "react-icons/fa6";

const BarberDetails = () => {
  const searchParams = useSearchParams();

  const workTime = searchParams.get('workTime');
  const status = searchParams.get('status');
  const location = searchParams.get('location');
  const name = searchParams.get('name');
  const number = searchParams.get('number');
  const shaveInfo = searchParams.get('shaveInfo');
  const parsedShaveInfo = shaveInfo ? JSON.parse(shaveInfo) : null;


  return (
    <div className={styles.container}>
      <div className={styles.header}>
      <div className={styles.nameImg}>{name ? name.charAt(0) : 'X'}</div>
        <div className={styles.info}>
          <p><span><IoTimeOutline/></span>{workTime || 'غير محدد'}</p>
          <p><span><IoLocationOutline/></span>{location || 'لم يحدد الموقع'}</p>
        </div>
        <div className={styles.status}>
        <span
        style={{
          color:
            status === 'closed'
              ? '#d32f2f'
              : status === 'aidel'
              ? '#388e3c'
              : status === 'working'
              ? '#f9a825'
              : '#757575',
          backgroundColor:
            status === 'closed'
              ? 'rgba(211, 47, 47, 0.2)'
              : status === 'aidel'
              ? 'rgba(56, 142, 60, 0.2)'
              : status === 'working'
              ? 'rgba(249, 168, 37, 0.2)' 
              : 'rgba(117, 117, 117, 0.2)', 
          padding: '5px 10px',
          borderRadius: '5px',
          display: 'inline-block',
        }}
      >
        {status === 'closed'
          ? 'مغلق حاليا'
          : status === 'aidel'
          ? '  متاح للزبون التالي '
          : status === 'working'
          ? 'يعمل حاليا'
          : 'غير معروف'}
      </span>
      </div>
      </div>
      <div className={styles.detail}>
        <div className={styles.first}>
          <h1>{name || 'غير محدد'}</h1>
          <span><IoPersonCircleSharp/></span>
        </div>
        <div className={styles.second}>
          <h1>{number || 'غير محدد'}</h1>
          <span><FaPhoneFlip/></span>
        </div>
      </div>
      <div className={styles.shaveTypes}>
        <h1>  أنواع الخدمات </h1>
        <ul>
          {parsedShaveInfo.map((data, index) => (
            <li key={index}>
              <h3>{data.shave}</h3> <span><IoTimerOutline/>{data.time}</span> / <span><FaMoneyCheckDollar/>{data.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BarberDetails;
