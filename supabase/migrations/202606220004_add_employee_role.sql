-- Add employee role for staff accounts created by admins.
--
-- Keep this migration limited to the enum change. PostgreSQL can reject using a newly
-- added enum value in the same transaction that adds it.

alter type public.app_role add value if not exists 'employee' after 'admin';
