import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'w86o34sf',
  dataset: 'production',
  apiVersion: '2025-11-10',
  useCdn: false,
});
