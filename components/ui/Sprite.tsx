import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { assetPath, cn } from '@/lib/utils';

interface Props {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

/** Pixel-art game sprite on a checkered backdrop, with a placeholder when the wiki had no image. */
export function Sprite({ src, alt, size = 32, className }: Props): React.JSX.Element {
  return (
    <span
      className={cn('sprite-bg inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md', className)}
      style={{ width: size + 8, height: size + 8 }}
    >
      {src ? (
        <Image src={assetPath(src)} alt={alt} width={size} height={size} className="pixelated h-auto max-h-full w-auto max-w-full" />
      ) : (
        <ImageOff aria-label={`No image for ${alt}`} className="size-4 text-stone-400" />
      )}
    </span>
  );
}
