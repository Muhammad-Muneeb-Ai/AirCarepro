import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  hideText?: boolean;
  variant?: 'default' | 'footer';
  orientation?: 'horizontal' | 'vertical';
}

export default function Logo({ 
  className, 
  hideText = false, 
  variant = 'default',
  orientation = 'horizontal'
}: LogoProps) {
  const isFooter = variant === 'footer';
  const isVertical = orientation === 'vertical';
  
  return (
    <div className={cn(
      "flex items-center gap-3 group", 
      isVertical ? "flex-col text-center" : "flex-row",
      className
    )}>
      <img 
        src="https://i.ibb.co/BH0CB99c/IMG-20260429-WA0049-removebg-preview.png" 
        alt="Apex Duct Cleaning Shield" 
        className={cn(
          isVertical ? "h-24 md:h-32 mb-2" : "h-10 md:h-12",
          "w-auto object-contain transition-transform duration-300 group-hover:scale-105",
          isFooter && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        )}
        referrerPolicy="no-referrer"
      />
      {!hideText && (
        <div className={cn(
          "flex flex-col justify-center",
          isVertical ? "items-center" : "items-start"
        )}>
          <div className="flex items-center">
            <span className={cn(
              isVertical ? "text-3xl md:text-5xl" : "text-xl md:text-2xl",
              "font-black tracking-tighter leading-none uppercase",
              isFooter ? "text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" : "text-[#0f3b5e]"
            )}>
              Apex
            </span>
            <span className={cn(
              isVertical ? "text-3xl md:text-5xl" : "text-xl md:text-2xl",
              "font-black tracking-tighter text-[#00A3FF] ml-1 md:ml-2 leading-none uppercase"
            )}>
              Duct
            </span>
          </div>
          <span className={cn(
            isVertical ? "text-sm md:text-lg mt-2 font-black" : "text-[10px] md:text-[11px] font-bold mt-1",
            "uppercase tracking-[0.35em] leading-none",
            isFooter ? "text-slate-300" : "text-[#0f3b5e]"
          )}>
            Cleaning
          </span>
        </div>
      )}
    </div>
  );
}
