import type { FastifyRequest } from 'fastify';
import { createHash } from 'node:crypto';

export type TenantRole = 'tenant_user' | 'tenant_admin';

export interface AuthContext {
  tenantId: string;
  userId: string;
  role: TenantRole;
  profileHash: string;
}

export interface AuthResolver {
  resolve(request: FastifyRequest): Promise<AuthContext>;
}

function parseAuthHeader(headerValue: string | undefined): string {
  if (!headerValue) {
    throw new Error('Missing Authorization header');
  }
  const parts = headerValue.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    throw new Error('Invalid Authorization header');
  }
  return parts[1];
}

function toRole(roleClaim: unknown): TenantRole {
  if (roleClaim === 'tenant_admin') {
    return 'tenant_admin';
  }
  return 'tenant_user';
}

function profileHash(tenantId: string, userId: string): string {
  return createHash('sha256').update(`${tenantId}:${userId}`).digest('hex');
}

export interface FirebaseAuthResolverDeps {
  verifyIdToken(token: string): Promise<Record<string, unknown>>;
}

export class FirebaseAuthResolver implements AuthResolver {
  constructor(private readonly deps: FirebaseAuthResolverDeps) {}

  async resolve(request: FastifyRequest): Promise<AuthContext> {
    const token = parseAuthHeader(request.headers.authorization);
    const decoded = await this.deps.verifyIdToken(token);
    const userId = typeof decoded.uid === 'string' ? decoded.uid : '';
    const tenantId = typeof decoded.tenantId === 'string' ? decoded.tenantId : '';
    if (!userId || !tenantId) {
      throw new Error('TOKEN_MISSING_UID_OR_TENANT_CLAIM');
    }
    const role = toRole(decoded.role);
    return {
      tenantId,
      userId,
      role,
      profileHash: profileHash(tenantId, userId),
    };
  }
}

export class TestAuthResolver implements AuthResolver {
  async resolve(request: FastifyRequest): Promise<AuthContext> {
    const tenantIdHeader = request.headers['x-tenant-id'];
    const userIdHeader = request.headers['x-user-id'];
    const roleHeader = request.headers['x-role'];
    const tenantId = typeof tenantIdHeader === 'string' ? tenantIdHeader : '';
    const userId = typeof userIdHeader === 'string' ? userIdHeader : '';
    const role = roleHeader === 'tenant_admin' ? 'tenant_admin' : 'tenant_user';
    if (!tenantId || !userId) {
      throw new Error('Missing test auth headers');
    }
    return {
      tenantId,
      userId,
      role,
      profileHash: profileHash(tenantId, userId),
    };
  }
}
