import { Wind } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({ className, iconSize = 24, textSize = "text-xl" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
        <Wind size={iconSize} />
      </div>
      <span className={cn("font-extrabold tracking-tighter text-slate-900", textSize)}>
        AirCare<span className="text-blue-600">Pro</span>
      </span>
    </div>
  );
}
