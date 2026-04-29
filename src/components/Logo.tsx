import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  hideText?: boolean;
  variant?: 'default' | 'footer';
}

export default function Logo({ className, hideText = false, variant = 'default' }: LogoProps) {
  const isFooter = variant === 'footer';
  
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <img 
        src="https://i.ibb.co/BH0CB99c/IMG-20260429-WA0049-removebg-preview.png" 
        alt="Apex Duct Cleaning Shield" 
        className={cn(
          "h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105",
          isFooter && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        )}
        referrerPolicy="no-referrer"
      />
      {!hideText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span className={cn(
              "text-xl md:text-2xl font-black tracking-tighter leading-none uppercase",
              isFooter ? "text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" : "text-[#0f3b5e]"
            )}>
              Apex
            </span>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-[#00A3FF] ml-1 leading-none uppercase">
              Duct
            </span>
          </div>
          <span className={cn(
            "text-[10px] md:text-[11px] font-bold uppercase tracking-[0.35em] leading-none mt-1",
            isFooter ? "text-slate-300" : "text-[#0f3b5e]"
          )}>
            Cleaning
          </span>
        </div>
      )}
    </div>
  );
}
