import type { EmergencyContact } from '../utils/emergencyContact'
import { withEmergencyContactDefaults } from '../utils/emergencyContact'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type LeaveType = '事假' | '病假' | '公假' | '丧假'

export interface LeaveApplication extends EmergencyContact {
  id: string
  studentName: string
  className: string
  courseName: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  rejectReason: string
  submittedAt: string
  approvedAt: string
  returned: boolean
  returnedAt: string
}

export const STORAGE_KEY = 'smart_campus_leave_records'

const RAW_APPLICATIONS: Omit<LeaveApplication, 'status' | 'rejectReason' | 'approvedAt' | 'returned' | 'returnedAt'>[] = [
  {
    id: 'L001',
    studentName: '张伟',
    className: '高三(1)班',
    courseName: '数学',
    leaveType: '病假',
    startDate: '2026-06-10',
    endDate: '2026-06-11',
    reason: '发烧38.5度，需要在家休息',
    emergencyContactName: '张父',
    emergencyContactPhone: '13800138001',
    submittedAt: '2026-06-09 14:30'
  },
  {
    id: 'L002',
    studentName: '李娜',
    className: '高三(2)班',
    courseName: '语文',
    leaveType: '事假',
    startDate: '2026-06-12',
    endDate: '2026-06-12',
    reason: '家中临时有事需要处理',
    emergencyContactName: '李母',
    emergencyContactPhone: '13800138002',
    submittedAt: '2026-06-11 09:15'
  },
  {
    id: 'L003',
    studentName: '王磊',
    className: '高三(1)班',
    courseName: '英语',
    leaveType: '公假',
    startDate: '2026-06-14',
    endDate: '2026-06-14',
    reason: '参加市级英语演讲比赛',
    emergencyContactName: '王父',
    emergencyContactPhone: '13800138003',
    submittedAt: '2026-06-12 16:00'
  },
  {
    id: 'L004',
    studentName: '赵敏',
    className: '高三(3)班',
    courseName: '物理',
    leaveType: '病假',
    startDate: '2026-06-15',
    endDate: '2026-06-16',
    reason: '肠胃不适需就医检查',
    emergencyContactName: '赵母',
    emergencyContactPhone: '13800138004',
    submittedAt: '2026-06-14 20:45'
  },
  {
    id: 'L005',
    studentName: '陈浩',
    className: '高三(2)班',
    courseName: '化学',
    leaveType: '事假',
    startDate: '2026-06-16',
    endDate: '2026-06-17',
    reason: '需回老家办理身份证',
    emergencyContactName: '陈父',
    emergencyContactPhone: '13800138005',
    submittedAt: '2026-06-15 08:30'
  },
  {
    id: 'L006',
    studentName: '刘洋',
    className: '高三(1)班',
    courseName: '数学',
    leaveType: '丧假',
    startDate: '2026-06-13',
    endDate: '2026-06-15',
    reason: '家中老人去世需要处理后事',
    emergencyContactName: '刘母',
    emergencyContactPhone: '13800138006',
    submittedAt: '2026-06-12 22:10'
  },
  {
    id: 'L007',
    studentName: '孙婷',
    className: '高三(3)班',
    courseName: '语文',
    leaveType: '病假',
    startDate: '2026-06-11',
    endDate: '2026-06-12',
    reason: '感冒发烧需卧床休息',
    emergencyContactName: '孙父',
    emergencyContactPhone: '13800138007',
    submittedAt: '2026-06-10 18:00'
  },
  {
    id: 'L008',
    studentName: '周杰',
    className: '高三(2)班',
    courseName: '英语',
    leaveType: '公假',
    startDate: '2026-06-16',
    endDate: '2026-06-16',
    reason: '代表学校参加区级运动会',
    emergencyContactName: '周母',
    emergencyContactPhone: '13800138008',
    submittedAt: '2026-06-15 10:20'
  },
  {
    id: 'L009',
    studentName: '吴芳',
    className: '高三(1)班',
    courseName: '物理',
    leaveType: '事假',
    startDate: '2026-06-17',
    endDate: '2026-06-18',
    reason: '家中房屋修缮需协助',
    emergencyContactName: '吴父',
    emergencyContactPhone: '13800138009',
    submittedAt: '2026-06-16 07:00'
  },
  {
    id: 'L010',
    studentName: '郑宇',
    className: '高三(3)班',
    courseName: '化学',
    leaveType: '病假',
    startDate: '2026-06-14',
    endDate: '2026-06-14',
    reason: '牙痛需就医拔牙',
    emergencyContactName: '郑母',
    emergencyContactPhone: '13800138010',
    submittedAt: '2026-06-13 21:30'
  }
]

export function getInitialApplications(): LeaveApplication[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as LeaveApplication[]
      let needsSave = false
      const migrated = parsed.map((item) => {
        const withDefaults = withEmergencyContactDefaults(item)
        const result = {
          returned: false,
          returnedAt: '',
          ...withDefaults
        }
        if (item.returned === undefined || item.returnedAt === undefined) {
          needsSave = true
        }
        if (!('emergencyContactName' in item) || !('emergencyContactPhone' in item)) {
          needsSave = true
        }
        return result
      })
      if (needsSave) {
        saveApplications(migrated)
      }
      return migrated
    } catch {
      // ignore
    }
  }
  const applications: LeaveApplication[] = RAW_APPLICATIONS.map((item) => ({
    ...item,
    status: 'pending' as LeaveStatus,
    rejectReason: '',
    approvedAt: '',
    returned: false,
    returnedAt: ''
  }))
  saveApplications(applications)
  return applications
}

export function saveApplications(applications: LeaveApplication[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}

export function addApplication(application: Omit<LeaveApplication, 'id' | 'status' | 'rejectReason' | 'approvedAt' | 'submittedAt' | 'returned' | 'returnedAt'>): LeaveApplication {
  const applications = getInitialApplications()
  const nextId = `L${String(applications.length + 1).padStart(3, '0')}`
  const newApplication: LeaveApplication = {
    ...application,
    id: nextId,
    status: 'pending',
    rejectReason: '',
    approvedAt: '',
    submittedAt: new Date().toLocaleString('zh-CN'),
    returned: false,
    returnedAt: ''
  }
  applications.unshift(newApplication)
  saveApplications(applications)
  return newApplication
}

export function getApplicationsByStudent(studentName: string): LeaveApplication[] {
  return getInitialApplications().filter((a) => a.studentName === studentName)
}
