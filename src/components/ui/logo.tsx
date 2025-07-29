import { GraduationCap } from 'lucide-react';

const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <div
      className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <GraduationCap className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  );
};

export default Logo;
