import { MainLayout } from 'src/layouts/main';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <MainLayout
      slotProps={{
        main: { sx: { marginTop: -10 } },
        footer: { sx: { bgcolor: '#efe3d4' } },
      }}
    >
      {children}
    </MainLayout>
  );
}
