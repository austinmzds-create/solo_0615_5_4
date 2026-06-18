import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createRouter, createWebHistory } from 'vue-router'
import LeaveApproval from './LeaveApproval.vue'
import {
  addApplication,
  saveApplications,
  STORAGE_KEY,
  type LeaveApplication
} from '../mock/leaves'

const createMockRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: 'Login', component: { template: '<div></div>' } },
      { path: '/leave-approval', name: 'LeaveApproval', component: LeaveApproval }
    ]
  })
}

const mountApproval = async () => {
  const router = createMockRouter()
  router.push('/leave-approval')
  await router.isReady()
  const wrapper = mount(LeaveApproval, {
    global: {
      plugins: [ElementPlus, router]
    }
  })
  await wrapper.vm.$nextTick()
  return wrapper
}

const setupTeacherLogin = () => {
  localStorage.setItem('smart_campus_current_user', 'teacher')
}

describe('LeaveApproval.vue - 紧急联系人字段回归测试', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setupTeacherLogin()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('提交申请后重新挂载审批页，紧急联系人字段应保留', () => {
    it('第一次填写紧急联系人，第二次不填写，刷新审批页后两条记录联系人各自正确', async () => {
      addApplication({
        studentName: '测试学生A',
        className: '高三(1)班',
        courseName: '数学',
        leaveType: '事假',
        startDate: '2026-06-20',
        endDate: '2026-06-21',
        reason: '家里有事需要回家处理',
        emergencyContactName: '王爸爸',
        emergencyContactPhone: '13912345678'
      })

      addApplication({
        studentName: '测试学生A',
        className: '高三(1)班',
        courseName: '语文',
        leaveType: '病假',
        startDate: '2026-06-22',
        endDate: '2026-06-22',
        reason: '感冒发烧需要休息',
        emergencyContactName: '',
        emergencyContactPhone: ''
      })

      const wrapper1 = await mountApproval()
      const pageText1 = wrapper1.text()
      expect(pageText1).toContain('王爸爸')
      expect(pageText1).toContain('13912345678')
      expect(pageText1).toContain('-')

      const stored1 = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as LeaveApplication[]
      const firstApp = stored1.find((a) => a.courseName === '数学')
      const secondApp = stored1.find((a) => a.courseName === '语文')
      expect(firstApp?.emergencyContactName).toBe('王爸爸')
      expect(firstApp?.emergencyContactPhone).toBe('13912345678')
      expect(secondApp?.emergencyContactName).toBe('')
      expect(secondApp?.emergencyContactPhone).toBe('')

      wrapper1.unmount()

      const wrapper2 = await mountApproval()
      const pageText2 = wrapper2.text()
      expect(pageText2).toContain('王爸爸')
      expect(pageText2).toContain('13912345678')

      const stored2 = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as LeaveApplication[]
      const firstAppAfter = stored2.find((a) => a.courseName === '数学')
      const secondAppAfter = stored2.find((a) => a.courseName === '语文')
      expect(firstAppAfter?.emergencyContactName).toBe('王爸爸')
      expect(firstAppAfter?.emergencyContactPhone).toBe('13912345678')
      expect(secondAppAfter?.emergencyContactName).toBe('')
      expect(secondAppAfter?.emergencyContactPhone).toBe('')
    })

    it('学生提交填写紧急联系人和电话的申请后，教师审批页首次挂载应显示这两个字段', async () => {
      const emergencyContactName = '王叔叔'
      const emergencyContactPhone = '13912345678'

      addApplication({
        studentName: '测试学生',
        className: '高三(1)班',
        courseName: '数学',
        leaveType: '事假',
        startDate: '2026-06-20',
        endDate: '2026-06-21',
        reason: '家里有事需要回家处理',
        emergencyContactName,
        emergencyContactPhone
      })

      const wrapper = await mountApproval()
      const pageText = wrapper.text()

      expect(pageText).toContain(emergencyContactName)
      expect(pageText).toContain(emergencyContactPhone)
    })

    it('学生提交填写紧急联系人和电话的申请后，重新挂载审批页仍应显示这两个字段', async () => {
      const emergencyContactName = '李阿姨'
      const emergencyContactPhone = '13898765432'

      addApplication({
        studentName: '测试学生2',
        className: '高三(2)班',
        courseName: '语文',
        leaveType: '病假',
        startDate: '2026-06-22',
        endDate: '2026-06-23',
        reason: '感冒发烧需要休息',
        emergencyContactName,
        emergencyContactPhone
      })

      const wrapper1 = await mountApproval()
      expect(wrapper1.text()).toContain(emergencyContactName)
      expect(wrapper1.text()).toContain(emergencyContactPhone)

      wrapper1.unmount()

      const wrapper2 = await mountApproval()
      const pageText2 = wrapper2.text()

      expect(pageText2).toContain(emergencyContactName)
      expect(pageText2).toContain(emergencyContactPhone)
    })

    it('多份申请均带有紧急联系人信息，重新挂载后所有记录字段都应保留', async () => {
      const contact1 = { name: '赵爸爸', phone: '13700001111' }
      const contact2 = { name: '钱妈妈', phone: '13700002222' }

      addApplication({
        studentName: '学生A',
        className: '高三(1)班',
        courseName: '英语',
        leaveType: '公假',
        startDate: '2026-06-24',
        endDate: '2026-06-24',
        reason: '参加英语竞赛',
        emergencyContactName: contact1.name,
        emergencyContactPhone: contact1.phone
      })

      addApplication({
        studentName: '学生B',
        className: '高三(3)班',
        courseName: '物理',
        leaveType: '丧假',
        startDate: '2026-06-25',
        endDate: '2026-06-27',
        reason: '家中长辈过世',
        emergencyContactName: contact2.name,
        emergencyContactPhone: contact2.phone
      })

      const wrapper1 = await mountApproval()
      expect(wrapper1.text()).toContain(contact1.name)
      expect(wrapper1.text()).toContain(contact1.phone)
      expect(wrapper1.text()).toContain(contact2.name)
      expect(wrapper1.text()).toContain(contact2.phone)

      wrapper1.unmount()

      const wrapper2 = await mountApproval()
      const pageText2 = wrapper2.text()

      expect(pageText2).toContain(contact1.name)
      expect(pageText2).toContain(contact1.phone)
      expect(pageText2).toContain(contact2.name)
      expect(pageText2).toContain(contact2.phone)
    })

    it('直接通过 localStorage 写入带有紧急联系人的申请数据，重新挂载后字段不应丢失', async () => {
      const emergencyContactName = '孙老师'
      const emergencyContactPhone = '13611112222'

      const mockData: LeaveApplication[] = [
        {
          id: 'L999',
          studentName: '直存学生',
          className: '高三(1)班',
          courseName: '化学',
          leaveType: '事假',
          startDate: '2026-06-28',
          endDate: '2026-06-29',
          reason: '直接存入localStorage测试',
          emergencyContactName,
          emergencyContactPhone,
          status: 'pending',
          rejectReason: '',
          submittedAt: '2026-06-18 10:00',
          approvedAt: ''
        }
      ]
      saveApplications(mockData)

      const wrapper1 = await mountApproval()
      expect(wrapper1.text()).toContain(emergencyContactName)
      expect(wrapper1.text()).toContain(emergencyContactPhone)

      wrapper1.unmount()

      const wrapper2 = await mountApproval()
      const pageText2 = wrapper2.text()

      expect(pageText2).toContain(emergencyContactName)
      expect(pageText2).toContain(emergencyContactPhone)

      const storedRaw = localStorage.getItem(STORAGE_KEY)
      expect(storedRaw).not.toBeNull()
      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as LeaveApplication[]
        const target = stored.find((a) => a.id === 'L999')
        expect(target).toBeDefined()
        expect(target?.emergencyContactName).toBe(emergencyContactName)
        expect(target?.emergencyContactPhone).toBe(emergencyContactPhone)
      }
    })
  })
})
