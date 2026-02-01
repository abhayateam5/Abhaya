'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PhoneLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) alert(error.message);
    else setOtpSent(true);
  };

  const verifyOtp = async () => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (error) alert(error.message);
    else alert('Phone login successful');
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Phone Login</h1>

      {!otpSent ? (
        <>
          <input
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <br /><br />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br /><br />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </main>
  );
}
