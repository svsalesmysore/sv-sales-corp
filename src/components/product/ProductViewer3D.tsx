'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Box, ImageIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProductImage, getFallbackImage } from '@/lib/image'

interface Props {
  productName: string
  categoryId: string
  productId: string
  sketchfabModelId?: string
}

export default function ProductViewer3D({ productName, categoryId, productId, sketchfabModelId }: Props) {
  const [mode, setMode] = useState<'photo' | '3d'>('photo')
  const [imgError, setImgError] = useState(false)

  const imageUrl = imgError
    ? getFallbackImage(800, 600)
    : getProductImage(categoryId, productId, 800, 600)

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
      {/* toggle tabs */}
      {sketchfabModelId && (
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setMode('photo')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              mode === 'photo'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <ImageIcon className="w-4 h-4" /> Photo
          </button>
          <button
            onClick={() => setMode('3d')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              mode === '3d'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Box className="w-4 h-4" /> 3D View
          </button>
        </div>
      )}

      {/* content area */}
      <div className="relative aspect-square sm:aspect-[4/3]">
        {mode === 'photo' ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : sketchfabModelId ? (
          <iframe
            title={`${productName} 3D model`}
            src={`https://sketchfab.com/models/${sketchfabModelId}/embed?autostart=1&ui_hint=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        ) : null}
      </div>

      {/* 3D credit */}
      {mode === '3d' && sketchfabModelId && (
        <div className="bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>3D model via Sketchfab</span>
          <a
            href={`https://sketchfab.com/models/${sketchfabModelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-brand-red transition-colors"
          >
            Open full view <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}
