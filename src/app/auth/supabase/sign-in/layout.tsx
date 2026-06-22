import { AuthSplitLayout } from 'src/layouts/auth-split';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <AuthSplitLayout
        slotProps={{
          section: {
            title: 'ศรีคชานัน',
            subtitle: 'เข้าสู่ระบบเพื่อจองคิว ดูนัดหมาย และจัดการประวัติบริการของคุณ',
            imgUrl: '/assets/spa/hero-ganesha.png',
            sx: {
              color: '#101513',
              maxWidth: 560,
              backgroundImage:
                'linear-gradient(180deg, rgba(250,246,237,0.72) 0%, rgba(248,242,233,0.86) 46%, rgba(248,242,233,0.98) 100%), url(/assets/spa/hero-ganesha.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '& > img': { display: 'none' },
              '& h3': {
                fontSize: 52,
                fontWeight: 950,
                letterSpacing: 0,
              },
              '& p': {
                color: '#46534d',
                lineHeight: 1.8,
              },
            },
          },
        }}
      >
        {children}
      </AuthSplitLayout>
    </GuestGuard>
  );
}
