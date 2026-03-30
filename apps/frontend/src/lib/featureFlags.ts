/**
 * Build-time public flags (Next inlines `NEXT_PUBLIC_*` at compile time).
 * @integration-boundary Flip `USE_PLATFORM_MISSIONS` when backend is ready for real sessions on /missions + desk.
 */
export function isPlatformMissionsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_PLATFORM_MISSIONS === 'true';
}
