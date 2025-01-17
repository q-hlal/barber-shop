
const Loading = () => {
  return (
    <div style={{ height:"100vh" , display: 'flex', alignItems: 'center', justifyContent:"center" , fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <p style={{ marginRight : "10px" , fontSize: '18px', color: '#333' }}>جاري التحميل</p>
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '5px solid #ccc',
          borderTop: '5px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
