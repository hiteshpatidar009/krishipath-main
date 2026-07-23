import useAuthStore from '../../core/store/useAuthStore';

export default function usePermissions() {
  const { hasPermission, role } = useAuthStore();

  const check = (permissionKey) => {
    return hasPermission(permissionKey);
  };

  const checkAny = (permissionKeys = []) => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const checkAll = (permissionKeys = []) => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    hasPermission: check,
    hasAnyPermission: checkAny,
    hasAllPermissions: checkAll,
    isSuperAdmin: role === 'SUPER_ADMIN',
  };
}
