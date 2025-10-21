/**
 * Function to generate a 6-digit OTP
 * @returns 6-digit OTP

 */
export const generateOtp = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};
