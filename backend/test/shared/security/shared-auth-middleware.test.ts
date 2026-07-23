import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SharedAuthMiddleware } from '../../../src/shared/security/middlewares/auth.middleware'

describe('SharedAuthMiddleware', () => {
  const originalTokenService = (SharedAuthMiddleware as any).tokenService
  const originalAuthRepository = (SharedAuthMiddleware as any).authRepository

  beforeEach(() => {
    (SharedAuthMiddleware as any).tokenService = {
      verifyAccess: vi.fn().mockReturnValue({
        sub: 'user-test',
        companyId: undefined,
        sessionId: 'session-test',
        accessLevel: 'full',
        isRoot: true,
      }),
    }

    (SharedAuthMiddleware as any).authRepository = {
      isSessionActive: vi.fn().mockResolvedValue(true),
      listUserRoles: vi.fn().mockResolvedValue([]),
      listUserPerms: vi.fn().mockResolvedValue([]),
    }
  })

  afterEach(() => {
    (SharedAuthMiddleware as any).tokenService = originalTokenService
    (SharedAuthMiddleware as any).authRepository = originalAuthRepository
    vi.restoreAllMocks()
  })

  it('should use X-Company-Id header when token claims omit companyId', async () => {
    const request = {
      headers: {
        authorization: 'Bearer mock-token',
      },
      header: (name: string) => {
        return name.toLowerCase() === 'x-company-id' ? 'tenant-123' : undefined
      },
    } as unknown as any

    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as any

    const next = vi.fn()

    await SharedAuthMiddleware.use(request, response, next)

    expect(next).toHaveBeenCalled()
    expect(request.securityContext).toBeDefined()
    expect(request.securityContext.companyId).toBe('tenant-123')
    expect((SharedAuthMiddleware as any).authRepository.listUserRoles).toHaveBeenCalledWith(
      'user-test',
      'tenant-123',
    )
    expect((SharedAuthMiddleware as any).authRepository.listUserPerms).toHaveBeenCalledWith(
      'user-test',
      'tenant-123',
    )
  })
})
