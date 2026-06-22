export const adminStats = [
  { label: 'ยอดจองวันนี้', value: '18', icon: 'solar:calendar-date-bold', color: '#2f7d54' },
  { label: 'รายได้เดือนนี้', value: '142K', icon: 'solar:wad-of-money-bold', color: '#8a5b26' },
  {
    label: 'ลูกค้าใหม่',
    value: '36',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: '#3d61a8',
  },
  { label: 'คิวว่าง', value: '9', icon: 'solar:clock-circle-bold', color: '#8c4f9f' },
] as const;

export const adminBookings = [
  ['10:00', 'คุณมินตรา', 'นวดน้ำมันคชานัน', 'พนักงาน: ดาว', 'ยืนยันคิวแล้ว'],
  ['11:30', 'คุณอร', 'พิธีผิวใสสมุนไพร', 'พนักงาน: น้ำ', 'รอยืนยันคิว'],
  ['14:30', 'คุณภาคิน', 'แช่เท้าดอกบัวและประคบ', 'พนักงาน: เมย์', 'ยืนยันคิวแล้ว'],
  ['16:00', 'คุณกานต์', 'นวดน้ำมันคชานัน', 'พนักงาน: ดาว', 'เลื่อนนัด'],
];

export const adminServices = [
  ['นวดน้ำมันคชานัน', '90 นาที', '2,400 บาท', 'เปิดขาย'],
  ['พิธีผิวใสสมุนไพร', '75 นาที', '1,900 บาท', 'เปิดขาย'],
  ['แช่เท้าดอกบัวและประคบ', '60 นาที', '1,500 บาท', 'เปิดขาย'],
];

export type AdminStaffStatus = 'active' | 'inactive';

export type AdminStaffMember = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  workload: string;
  permissions: string[];
  status: AdminStaffStatus;
};

export const adminStaff: AdminStaffMember[] = [
  {
    id: 'staff-dao',
    name: 'ดาว',
    email: 'dao@example.com',
    specialty: 'นวดน้ำมัน',
    workload: '5 คิววันนี้',
    permissions: ['dashboard', 'services', 'staff'],
    status: 'active',
  },
  {
    id: 'staff-nam',
    name: 'น้ำ',
    email: 'nam@example.com',
    specialty: 'ดูแลผิว',
    workload: '4 คิววันนี้',
    permissions: ['dashboard', 'services'],
    status: 'active',
  },
  {
    id: 'staff-may',
    name: 'เมย์',
    email: 'may@example.com',
    specialty: 'ประคบสมุนไพร',
    workload: '3 คิววันนี้',
    permissions: ['dashboard'],
    status: 'inactive',
  },
];

export const adminMenuPermissions = [
  { value: 'dashboard', label: 'แดชบอร์ด' },
  { value: 'registrationRequests', label: 'คำขอสมัครสมาชิก' },
  { value: 'services', label: 'บริการสปา' },
  { value: 'staff', label: 'พนักงาน' },
  { value: 'customers', label: 'ลูกค้า' },
  { value: 'promotions', label: 'โปรโมชั่น / คูปอง' },
  { value: 'revenue', label: 'รายงานรายได้' },
];

export const adminCustomers = [
  ['คุณมินตรา', 'ลูกค้าประจำ', '12 ครั้ง', 'คูปองวันเกิด'],
  ['คุณอร', 'สมาชิกใหม่', '2 ครั้ง', 'ติดตามชำระเงิน'],
  ['คุณภาคิน', 'ลูกค้าประจำ', '8 ครั้ง', 'ชอบรอบบ่าย'],
];

export const adminPromotions = [
  'ลด 20% สำหรับจองออนไลน์',
  'คูปองวันเกิดสมาชิก',
  'แพ็กเกจคู่รักวันธรรมดา',
];

export const adminRevenueRows = [
  ['จองออนไลน์', '82,400 บาท', '58%'],
  ['หน้าร้าน', '45,200 บาท', '32%'],
  ['คูปอง / แพ็กเกจ', '14,400 บาท', '10%'],
];
