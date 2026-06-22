'use client';

import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { signUp } from '../../context/supabase';
import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';

// ----------------------------------------------------------------------

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const SignUpSchema = z.object({
  firstName: z.string().min(1, { error: 'กรุณากรอกชื่อ' }),
  lastName: z.string().min(1, { error: 'กรุณากรอกนามสกุล' }),
  email: schemaUtils.email(),
  password: z
    .string()
    .min(1, { error: 'กรุณากรอกรหัสผ่าน' })
    .min(6, { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
});

// ----------------------------------------------------------------------

export function SupabaseSignUpView() {
  const showPassword = useBoolean();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const defaultValues: SignUpSchemaType = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      setRequestSent(true);
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
      >
        <Field.Text
          name="firstName"
          label="ชื่อ"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Field.Text
          name="lastName"
          label="นามสกุล"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <Field.Text name="email" label="อีเมล" slotProps={{ inputLabel: { shrink: true } }} />

      <Field.Text
        name="password"
        label="รหัสผ่าน"
        placeholder="อย่างน้อย 6 ตัวอักษร"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="กำลังส่งคำขอ..."
      >
        ส่งคำขอลงทะเบียน
      </Button>
    </Box>
  );

  const renderPendingRequest = () => (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        color: '#101513',
        bgcolor: '#f8f2e9',
        border: '1px solid rgba(44, 49, 45, 0.08)',
      }}
    >
      <Iconify width={42} icon="solar:check-circle-bold" />
      <Typography sx={{ mt: 2, fontSize: 24, fontWeight: 950 }}>
        ส่งคำขอลงทะเบียนแล้ว
      </Typography>
      <Typography sx={{ mt: 1, color: '#64706b', lineHeight: 1.8 }}>
        กรุณารอผู้ดูแลระบบอนุมัติบัญชีของคุณก่อน จึงจะสามารถเข้าสู่ระบบและจองคิวได้
      </Typography>
      <Button
        fullWidth
        component={RouterLink}
        href={paths.auth.supabase.signIn}
        variant="contained"
        sx={{ mt: 3 }}
      >
        ไปหน้าเข้าสู่ระบบ
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="ลงทะเบียนสมาชิก"
        description={
          <>
            {`มีบัญชีอยู่แล้ว? `}
            <Link component={RouterLink} href={paths.auth.supabase.signIn} variant="subtitle2">
              เข้าสู่ระบบ
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {requestSent ? (
        renderPendingRequest()
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      )}

      {!requestSent && <SignUpTerms />}
    </>
  );
}
