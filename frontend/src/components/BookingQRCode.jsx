import { QRCodeSVG } from 'qrcode.react';

const BookingQRCode = ({ bookingId }) => {
  if (!bookingId) return null;

  return (
    <div className="flex flex-col items-center my-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <QRCodeSVG
        value={`PARKSMART-BOOKING-${bookingId}`}
        size={120}
        bgColor="#ffffff"
        fgColor="#1c2024"
        level="M"
      />
      <p className="text-xs text-gray-500 font-medium mt-3 text-center">
        Show this QR code at the parking entrance
      </p>
    </div>
  );
};

export default BookingQRCode;
