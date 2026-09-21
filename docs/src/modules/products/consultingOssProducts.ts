export const CONSULTING_OSS_PRODUCTS = [
  {
    id: 'sgit',
    name: 'sgit',
    fullName: 'sgit',
    description: 'Git worktree and landing CLI for agent/repo workflows',
    icon: 'product-core',
  },
  {
    id: 'gdock',
    name: 'gdock',
    fullName: 'gdock',
    description: 'Desktop dock for launching and controlling local agent sessions',
    icon: 'product-toolpad',
  },
  {
    id: 'status',
    name: 'status',
    fullName: 'status',
    description: 'Public status and incident surface for Stoked products',
    icon: 'product-templates',
  },
] as const;

export type ConsultingOssProductId = (typeof CONSULTING_OSS_PRODUCTS)[number]['id'];

export function consultingOssProduct(productId: string) {
  return CONSULTING_OSS_PRODUCTS.find((product) => product.id === productId);
}
