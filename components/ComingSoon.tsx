
import React from 'react';

interface ComingSoonProps {
  message?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ message }) => (
  <div className="text-center p-6 bg-slate-100 rounded-lg">
    <h3 className="text-lg font-semibold text-slate-700">Segera Hadir!</h3>
    <p className="text-slate-500 mt-2">
      {message || 'Fungsionalitas interaktif ini sedang dalam pengembangan. Silakan periksa kembali nanti!'}
    </p>
  </div>
);

export default ComingSoon;
