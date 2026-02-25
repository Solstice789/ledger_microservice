export type Item = {
  id: string;
  name: string;
  priceInCents: number;
};

export const ITEMS: readonly Item[] = [
  {
    id: '5aa6d584-f135-4bcd-8fa8-b035a8b875cd',
    name: 'Test Item 1',
    priceInCents: 100,
  },
  {
    id: 'c09ce33f-07e3-48f5-b8f8-2f7c8d2a2755',
    name: 'Test Item 2',
    priceInCents: 200,
  },
  {
    id: 'fef3b13c-a0b2-4ba6-b13d-de56f5593144',
    name: 'Test Item 3',
    priceInCents: 500,
  },
  {
    id: 'e9de184a-5ac6-4c73-ad44-14c3f182a7e2',
    name: 'Test Item 4',
    priceInCents: 1000,
  },
  {
    id: 'dd8db290-8089-4f12-8527-f72f470ab6d8',
    name: 'Test Item 5',
    priceInCents: 10000,
  },
] as const;

// Added for constant O(1) lookup by item ID
export const ITEMS_BY_ID: ReadonlyMap<string, Item> = new Map(
  ITEMS.map((item): [string, Item] => [item.id, item]),
);

// Get item by ID O(1) constant time
export function getItemById(id: string): Item | undefined {
  return ITEMS_BY_ID.get(id);
}
