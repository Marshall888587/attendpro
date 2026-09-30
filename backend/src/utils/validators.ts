export const phoneRegex = /^\+?[0-9]{8,15}$/;

export function requireContact<T extends { email?: string | null; telephone?: string | null }>(
  data: T,
  existing?: { email?: string | null; telephone?: string | null }
) {
  const email = data.email !== undefined ? data.email : existing?.email;
  const telephone = data.telephone !== undefined ? data.telephone : existing?.telephone;
  return Boolean(email || telephone);
}
