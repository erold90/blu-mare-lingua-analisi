import { motion } from "framer-motion";

// Shimmer animation for skeleton loading
const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear",
  },
};

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const Skeleton = ({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
};

// Card skeleton for apartment cards
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Skeleton height={200} className="w-full" rounded="none" />
      <div className="p-4 space-y-3">
        <Skeleton height={24} width="70%" />
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="60%" />
        <div className="flex gap-2 pt-2">
          <Skeleton height={28} width={60} rounded="full" />
          <Skeleton height={28} width={80} rounded="full" />
        </div>
      </div>
    </div>
  );
};

// Image skeleton for galleries
export const ImageSkeleton = ({ aspectRatio = "4/3" }: { aspectRatio?: string }) => {
  return (
    <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio }}>
      <Skeleton className="absolute inset-0" rounded="lg" />
    </div>
  );
};

// Text skeleton for paragraphs
export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  );
};

// Hero skeleton
export const HeroSkeleton = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <Skeleton className="absolute inset-0" rounded="none" />
      <div className="absolute inset-0 bg-black/20 z-10" />
      <div className="relative z-20 text-center space-y-6 px-8">
        <Skeleton height={80} width={400} className="mx-auto" />
        <Skeleton height={4} width={96} className="mx-auto" />
        <Skeleton height={32} width={300} className="mx-auto" />
        <Skeleton height={56} width={200} className="mx-auto mt-8" />
      </div>
    </div>
  );
};

// Carousel skeleton
export const CarouselSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Skeleton height={40} width={300} className="mx-auto" />
        <Skeleton height={24} width={400} className="mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <ImageSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Grid skeleton for apartment listings
export const ApartmentGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
