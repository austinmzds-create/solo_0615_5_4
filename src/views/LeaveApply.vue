<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, View, SwitchButton, Calendar, User, Phone } from '@element-plus/icons-vue'
import {
  getApplicationsByStudent,
  addApplication,
  type LeaveApplication,
  type LeaveStatus,
  type LeaveType
} from '../mock/leaves'
import {
  DEFAULT_EMERGENCY_CONTACT,
  EMERGENCY_CONTACT_VALIDATION_RULES,
  displayContactName,
  displayContactPhone
} from '../utils/emergencyContact'
import { mockUsers } from '../mock/accounts'

const router = useRouter()

const applyFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentApplication = ref<LeaveApplication | null>(null)
const myApplications = ref<LeaveApplication[]>([])

const applyForm = reactive({
  courseName: '',
  leaveType: '' as LeaveType | '',
  startDate: '',
  endDate: '',
  reason: '',
  ...DEFAULT_EMERGENCY_CONTACT
})

const currentUser = computed(() => {
  const username = localStorage.getItem('smart_campus_current_user')
  if (!username) return null
  return mockUsers.find((u) => u.username === username) || null
})

const courseOptions = ['数学', '语文', '英语', '物理', '化学']
const leaveTypeOptions: LeaveType[] = ['事假', '病假', '公假', '丧假']

const applyRules: FormRules = {
  courseName: [{ required: true, message: '请选择课程', trigger: 'change' }],
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [
    { required: true, message: '请填写请假原因', trigger: 'blur' },
    { min: 5, message: '请假原因至少5个字', trigger: 'blur' }
  ],
  ...EMERGENCY_CONTACT_VALIDATION_RULES
}

onMounted(() => {
  if (!currentUser.value || currentUser.value.role !== 'student') {
    router.replace('/login')
    return
  }
  loadMyApplications()
})

const loadMyApplications = () => {
  if (currentUser.value) {
    myApplications.value = getApplicationsByStudent(currentUser.value.name)
  }
}

const openApplyDialog = () => {
  resetApplyForm()
  dialogVisible.value = true
}

const resetApplyForm = () => {
  applyForm.courseName = ''
  applyForm.leaveType = ''
  applyForm.startDate = ''
  applyForm.endDate = ''
  applyForm.reason = ''
  Object.assign(applyForm, DEFAULT_EMERGENCY_CONTACT)
}

const validateDateRange = () => {
  if (applyForm.startDate && applyForm.endDate) {
    if (applyForm.endDate < applyForm.startDate) {
      ElMessage.warning('结束日期不能早于开始日期')
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  if (!applyFormRef.value || !currentUser.value) return

  if (!validateDateRange()) return

  await applyFormRef.value.validate((valid) => {
    if (!valid) return

    submitLoading.value = true
    setTimeout(() => {
      if (applyForm.leaveType) {
        addApplication({
          studentName: currentUser.value!.name,
          className: '高三(1)班',
          courseName: applyForm.courseName,
          leaveType: applyForm.leaveType,
          startDate: applyForm.startDate,
          endDate: applyForm.endDate,
          reason: applyForm.reason,
          emergencyContactName: applyForm.emergencyContactName,
          emergencyContactPhone: applyForm.emergencyContactPhone
        })
        ElMessage.success('申请提交成功，等待教师审批')
        dialogVisible.value = false
        resetApplyForm()
        loadMyApplications()
      }
      submitLoading.value = false
    }, 500)
  })
}

const handleView = (row: LeaveApplication) => {
  currentApplication.value = row
  detailVisible.value = true
}

const handleRefresh = () => {
  loadMyApplications()
  ElMessage.success('已刷新')
}

const handleLogout = () => {
  localStorage.removeItem('smart_campus_current_user')
  router.replace('/login')
}

const statusTagType = (status: LeaveStatus) => {
  const map: Record<LeaveStatus, '' | 'success' | 'danger' | 'warning'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status]
}

const statusLabel = (status: LeaveStatus) => {
  const map: Record<LeaveStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status]
}
</script>

<template>
  <div class="apply-page">
    <el-container>
      <el-header class="page-header">
        <div class="header-left">
          <h1 class="page-title">外出申请管理</h1>
          <span class="student-name">{{ currentUser?.name }}</span>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Plus" @click="openApplyDialog">
            提交申请
          </el-button>
          <el-button :icon="SwitchButton" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="page-main">
        <el-card class="table-card" shadow="never">
          <div class="card-header">
            <h3 class="card-title">我的申请记录</h3>
            <el-button :icon="Refresh" link @click="handleRefresh">刷新</el-button>
          </div>

          <el-table :data="myApplications" row-key="id" stripe border style="width: 100%">
            <el-table-column prop="id" label="申请编号" width="100" />
            <el-table-column prop="courseName" label="课程" width="90" />
            <el-table-column prop="leaveType" label="请假类型" width="90" />
            <el-table-column label="请假时间" width="200">
              <template #default="{ row }">
                {{ row.startDate }} 至 {{ row.endDate }}
              </template>
            </el-table-column>
            <el-table-column label="紧急联系人" width="180">
              <template #default="{ row }">
                <div class="contact-cell">
                  <el-icon><User /></el-icon>
                  <span>{{ displayContactName(row) }}</span>
                  <el-icon class="phone-icon"><Phone /></el-icon>
                  <span>{{ displayContactPhone(row) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="请假原因" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" :icon="View" @click="handleView(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="myApplications.length === 0" description="暂无申请记录，点击右上角提交申请" />
        </el-card>
      </el-main>
    </el-container>

    <el-dialog
      v-model="dialogVisible"
      title="提交外出申请"
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="applyFormRef"
        :model="applyForm"
        :rules="applyRules"
        label-width="100px"
      >
        <el-form-item label="课程" prop="courseName">
          <el-select v-model="applyForm.courseName" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="course in courseOptions"
              :key="course"
              :label="course"
              :value="course"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="applyForm.leaveType" placeholder="请选择请假类型" style="width: 100%">
            <el-option
              v-for="type in leaveTypeOptions"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="applyForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="applyForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="applyForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请详细说明请假原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">紧急联系信息</el-divider>

        <el-form-item label="联系人姓名" prop="emergencyContactName">
          <el-input
            v-model="applyForm.emergencyContactName"
            placeholder="请输入紧急联系人姓名"
            :prefix-icon="User"
            maxlength="20"
            clearable
          />
        </el-form-item>

        <el-form-item label="联系人电话" prop="emergencyContactPhone">
          <el-input
            v-model="applyForm.emergencyContactPhone"
            placeholder="请输入11位手机号码"
            :prefix-icon="Phone"
            maxlength="11"
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="申请详情" width="520px" destroy-on-close>
      <template v-if="currentApplication">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请编号">{{ currentApplication.id }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ currentApplication.studentName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentApplication.className }}</el-descriptions-item>
          <el-descriptions-item label="课程">{{ currentApplication.courseName }}</el-descriptions-item>
          <el-descriptions-item label="请假类型">{{ currentApplication.leaveType }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusTagType(currentApplication.status)" size="small">
              {{ statusLabel(currentApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentApplication.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentApplication.endDate }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ displayContactName(currentApplication) }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ displayContactPhone(currentApplication) }}</el-descriptions-item>
          <el-descriptions-item label="请假原因" :span="2">{{ currentApplication.reason }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentApplication.submittedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="currentApplication.approvedAt" label="审批时间">
            {{ currentApplication.approvedAt }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentApplication.status === 'rejected' && currentApplication.rejectReason"
            label="驳回原因"
            :span="2"
          >
            <span style="color: #f56c6c">{{ currentApplication.rejectReason }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.apply-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.student-name {
  font-size: 14px;
  color: #909399;
}

.page-main {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.contact-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 13px;
}

.phone-icon {
  margin-left: 8px;
}
</style>
