import type { Metadata } from 'next';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Sri Kachanan Kayatri Mantra Spa',
  description:
    'สปาองค์เทพที่ผสานพิธีบูชา ดอกบัว น้ำมันมงคล สมุนไพร และการนวดผ่อนคลายเพื่อฟื้นสมดุลกายใจ',
};

export default function Page() {
  return <HomeView />;
}
