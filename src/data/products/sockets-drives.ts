import type { Product } from '../types'

const SOCKET_SIZES_MM = [8,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,32]

export const socketsDriverProducts: Product[] = [
  { id: 'socket-box-half', name: 'Socket Box 1/2" Drive', description: 'Complete socket set in 1/2" drive with box', categoryId: 'sockets-drives', subcategory: 'Socket Sets', unit: 'Box', imageQuery: 'socket set 1/2 drive box automotive', tags: ['socket','set','1/2 drive'], inStock: true },
  { id: 'heavy-socket-36mm', name: 'Heavy Duty Socket 36mm 3/4" Drive', description: '36mm heavy duty socket 3/4" drive for trucks and HCVs', categoryId: 'sockets-drives', subcategory: 'Heavy Duty Sockets', unit: 'No', imageQuery: 'heavy duty socket 36mm 3/4 drive', tags: ['socket','heavy duty','36mm','3/4 drive'], specifications: { Size: '36mm', Drive: '3/4"' }, inStock: true },
  { id: 'heavy-socket-41mm', name: 'Heavy Duty Socket 41mm 3/4" Drive', description: '41mm heavy duty socket 3/4" drive', categoryId: 'sockets-drives', subcategory: 'Heavy Duty Sockets', unit: 'No', imageQuery: 'heavy duty socket 41mm 3/4 drive', tags: ['socket','heavy duty','41mm'], specifications: { Size: '41mm', Drive: '3/4"' }, inStock: true },
  { id: 'heavy-socket-46mm', name: 'Heavy Duty Socket 46mm 3/4" Drive', description: '46mm heavy duty socket 3/4" drive', categoryId: 'sockets-drives', subcategory: 'Heavy Duty Sockets', unit: 'No', imageQuery: 'heavy duty socket 46mm 3/4 drive', tags: ['socket','heavy duty','46mm'], specifications: { Size: '46mm', Drive: '3/4"' }, inStock: true },
  { id: 'heavy-socket-50mm', name: 'Heavy Duty Socket 50mm 3/4" Drive', description: '50mm heavy duty socket 3/4" drive', categoryId: 'sockets-drives', subcategory: 'Heavy Duty Sockets', unit: 'No', imageQuery: 'heavy duty socket 50mm', tags: ['socket','heavy duty','50mm'], specifications: { Size: '50mm', Drive: '3/4"' }, inStock: true },
  { id: 'heavy-socket-55mm', name: 'Heavy Duty Socket 55mm 3/4" Drive', description: '55mm heavy duty socket 3/4" drive', categoryId: 'sockets-drives', subcategory: 'Heavy Duty Sockets', unit: 'No', imageQuery: 'heavy duty socket 55mm industrial', tags: ['socket','heavy duty','55mm'], specifications: { Size: '55mm', Drive: '3/4"' }, inStock: true },
  ...SOCKET_SIZES_MM.map((mm) => ({
    id: `socket-half-${mm}mm`,
    name: `Socket 1/2" Sq Drive ${mm}mm`,
    description: `${mm}mm socket with 1/2" square drive`,
    categoryId: 'sockets-drives',
    subcategory: '1/2" Drive Sockets',
    unit: 'No' as const,
    imageQuery: 'socket wrench 1/2 drive metric',
    tags: ['socket','1/2 drive', `${mm}mm`],
    specifications: { Size: `${mm}mm`, Drive: '1/2"' },
    inStock: true,
  })),
  { id: 't-bar-half', name: 'T Bar 1/2" Drive', description: 'T-bar handle for 1/2" drive sockets', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'T bar socket drive handle', tags: ['T bar','1/2 drive'], inStock: true },
  { id: 't-bar-three-quarter', name: 'T Bar 3/4" Drive', description: 'T-bar handle for 3/4" drive sockets', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'T bar socket 3/4 drive handle', tags: ['T bar','3/4 drive'], inStock: true },
  { id: 'l-rod-half-300', name: 'L Rod 1/2" Drive 300mm', description: 'L-rod extension 300mm for 1/2" drive sockets', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'L rod socket drive extension', tags: ['L rod','1/2 drive','300mm'], inStock: true },
  { id: 'l-rod-three-quarter-500', name: 'L Rod 3/4" Drive 500mm', description: 'L-rod extension 500mm for 3/4" drive sockets', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'L rod socket 3/4 drive 500mm', tags: ['L rod','3/4 drive','500mm'], inStock: true },
  { id: 'l-rod-half-sq-300', name: 'L Rod 1/2" Sq Drive 300mm', description: 'Square drive L-rod 300mm for 1/2" square drive', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'L rod square drive socket extension', tags: ['L rod','1/2 sq drive'], inStock: true },
  { id: 'l-rod-three-quarter-sq-450', name: 'L Rod 3/4" Sq Drive 450mm', description: 'Square drive L-rod 450mm for 3/4" square drive', categoryId: 'sockets-drives', subcategory: 'Drive Accessories', unit: 'No', imageQuery: 'L rod square drive socket 3/4', tags: ['L rod','3/4 sq drive'], inStock: true },
]
