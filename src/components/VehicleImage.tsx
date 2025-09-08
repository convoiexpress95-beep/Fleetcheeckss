import React from 'react';
import { getVehicleImageUrl } from '@/lib/utils';

type Props = {
  imagePath?: string | null;
  bodyType?: string | null;
  alt?: string;
  className?: string;
};

export const VehicleImage: React.FC<Props> = ({ imagePath, bodyType, alt, className }) => {
  const [src, setSrc] = React.useState(
    getVehicleImageUrl({ image_path: imagePath, body_type: bodyType })
  );
  return (
    <div className={"w-full h-32 md:h-40 bg-muted/40 rounded-md overflow-hidden flex items-center justify-center " + (className || '')}>
      {src ? (
        // Use img for simplicity; could switch to next/image if migrated
        <img
          src={src}
          alt={alt || 'Véhicule'}
          className="object-contain w-full h-full"
          loading="lazy"
          onError={() => {
            const fallback = getVehicleImageUrl({ body_type: bodyType });
            if (fallback && fallback !== src) setSrc(fallback);
          }}
        />
      ) : (
        <div className="text-xs text-muted-foreground">Image indisponible</div>
      )}
    </div>
  );
};

export default VehicleImage;
