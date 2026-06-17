// src/utils/authUtils.js

/**
 * Verifica se o usuário tem permissão total (Administrador).
 */
export const isSuperUserOrAdmin = (user) => {
  if (!user) return false;
  return user.is_superuser || user.role === "admin";
};

/**
 * Verifica se o usuário tem permissão de gerenciar/editar/adicionar equipamentos (Administrador ou Padrão).
 */
export const hasManagePermission = (user) => {
  if (!user) return false;
  return user.is_superuser || user.role === "admin" || user.role === "padrao";
};

/**
 * Verifica se o usuário tem permissão para deletar equipamentos (Apenas Administrador).
 */
export const canDelete = (user) => {
  return isSuperUserOrAdmin(user);
};
