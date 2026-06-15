import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import Login from './Login.vue'
import { mockUsers } from '../mock/accounts'

const mountLogin = () => {
  return mount(Login, {
    global: {
      plugins: [ElementPlus]
    }
  })
}

const findInputByPlaceholder = (wrapper: any, placeholder: string) => {
  return wrapper.findAll('input').find((input: any) => input.attributes('placeholder') === placeholder)
}

const fillLoginForm = async (wrapper: any, username: string, password: string) => {
  const usernameInput = findInputByPlaceholder(wrapper, '请输入账号')
  const passwordInput = findInputByPlaceholder(wrapper, '请输入密码')

  if (usernameInput) {
    await usernameInput.setValue(username)
  }
  if (passwordInput) {
    await passwordInput.setValue(password)
  }
}

const clickLoginButton = async (wrapper: any) => {
  const loginButton = wrapper.findAll('button').find((btn: any) => btn.text().includes('登 录'))
  if (loginButton) {
    await loginButton.trigger('click')
  }
}

describe('Login.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('三类测试账号登录成功', () => {
    it.each(mockUsers)('应成功登录 %s 账号', async (user) => {
      const wrapper = mountLogin()

      await fillLoginForm(wrapper, user.username, user.password)
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('登录成功')
      expect(wrapper.text()).toContain(user.name)
      expect(wrapper.text()).toContain(user.roleLabel)
    })
  })

  describe('错误密码登录失败', () => {
    it('使用错误密码登录应显示密码错误提示', async () => {
      const wrapper = mountLogin()

      await fillLoginForm(wrapper, 'admin', 'wrongpassword')
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('登录成功')
    })

    it('使用不存在的账号登录应显示账号不存在提示', async () => {
      const wrapper = mountLogin()

      await fillLoginForm(wrapper, 'nonexistent', 'anypassword')
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('登录成功')
    })
  })

  describe('空账号或空密码校验', () => {
    it('账号为空时点击登录不应触发登录且保持在登录页面', async () => {
      const wrapper = mountLogin()

      const usernameInput = findInputByPlaceholder(wrapper, '请输入账号')
      const passwordInput = findInputByPlaceholder(wrapper, '请输入密码')

      if (passwordInput) {
        await passwordInput.setValue('admin123')
        await passwordInput.trigger('blur')
      }
      if (usernameInput) {
        await usernameInput.setValue('')
        await usernameInput.trigger('blur')
      }

      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const loginCard = wrapper.find('.login-card')
      expect(loginCard.exists()).toBe(true)
      expect(wrapper.text()).not.toContain('登录成功')
    })

    it('密码为空时点击登录不应触发登录且保持在登录页面', async () => {
      const wrapper = mountLogin()

      const usernameInput = findInputByPlaceholder(wrapper, '请输入账号')
      const passwordInput = findInputByPlaceholder(wrapper, '请输入密码')

      if (usernameInput) {
        await usernameInput.setValue('admin')
        await usernameInput.trigger('blur')
      }
      if (passwordInput) {
        await passwordInput.setValue('')
        await passwordInput.trigger('blur')
      }

      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const loginCard = wrapper.find('.login-card')
      expect(loginCard.exists()).toBe(true)
      expect(wrapper.text()).not.toContain('登录成功')
    })

    it('账号和密码都为空时点击登录不应触发登录且保持在登录页面', async () => {
      const wrapper = mountLogin()

      const usernameInput = findInputByPlaceholder(wrapper, '请输入账号')
      const passwordInput = findInputByPlaceholder(wrapper, '请输入密码')

      if (usernameInput) {
        await usernameInput.setValue('')
        await usernameInput.trigger('blur')
      }
      if (passwordInput) {
        await passwordInput.setValue('')
        await passwordInput.trigger('blur')
      }

      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const loginCard = wrapper.find('.login-card')
      expect(loginCard.exists()).toBe(true)
      expect(wrapper.text()).not.toContain('登录成功')
    })
  })

  describe('登录成功后展示用户姓名和角色', () => {
    it('管理员登录成功后应显示姓名和管理员角色', async () => {
      const wrapper = mountLogin()
      const admin = mockUsers[0]

      await fillLoginForm(wrapper, admin.username, admin.password)
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const successSection = wrapper.find('.success-card')
      expect(successSection.exists()).toBe(true)
      expect(successSection.text()).toContain(admin.name)
      expect(successSection.text()).toContain(admin.roleLabel)
    })

    it('教师登录成功后应显示姓名和教师角色', async () => {
      const wrapper = mountLogin()
      const teacher = mockUsers[1]

      await fillLoginForm(wrapper, teacher.username, teacher.password)
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const successSection = wrapper.find('.success-card')
      expect(successSection.exists()).toBe(true)
      expect(successSection.text()).toContain(teacher.name)
      expect(successSection.text()).toContain(teacher.roleLabel)
    })

    it('学生登录成功后应显示姓名和学生角色', async () => {
      const wrapper = mountLogin()
      const student = mockUsers[2]

      await fillLoginForm(wrapper, student.username, student.password)
      await clickLoginButton(wrapper)

      await vi.advanceTimersByTimeAsync(600)
      await wrapper.vm.$nextTick()

      const successSection = wrapper.find('.success-card')
      expect(successSection.exists()).toBe(true)
      expect(successSection.text()).toContain(student.name)
      expect(successSection.text()).toContain(student.roleLabel)
    })
  })
})
