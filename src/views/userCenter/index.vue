<template>
  <div class="center-page">
    <div class="center-top">
      <div class="avatar">
        {{ avatarChar }}
      </div>
      <div class="info">
        <h3>{{ auth.nickName }}</h3>
        <el-tag effect="plain" size="small">{{ auth.roles.join(', ') || '暂无角色' }}</el-tag>
      </div>
    </div>

    <div class="center-cards">
      <el-card shadow="never" class="profile-card">
        <template #header><span>基本资料</span></template>
        <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="80px" style="max-width: 460px">
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model.trim="profileForm.nickName" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.sex">
              <el-radio :value="0">男</el-radio>
              <el-radio :value="1">女</el-radio>
              <el-radio :value="2">未知</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="手机号" prop="tel">
            <el-input v-model.trim="profileForm.tel" maxlength="11" />
          </el-form-item>
          <el-form-item label="座机">
            <el-input v-model.trim="profileForm.cell" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="profileForm.email" />
          </el-form-item>
          <el-form-item label="岗位ID">
            <el-input-number v-model="profileForm.postId" :min="0" controls-position="right" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="profileSaving" @click="handleSaveProfile">保存</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="password-card">
        <template #header><span>修改密码</span></template>
        <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="90px" style="max-width: 460px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="pwdForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="pwdForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="pwdSaving" @click="handleChangePwd">修改</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'
import { getUserInfo } from '@/api/auth'
import { updateUser, changeMyPassword } from '@/api/user'

const router = useRouter()
const auth = useAuthStore()
const menu = useMenuStore()

const avatarChar = computed(() => (auth.nickName || '?')[0])

const profileFormRef = ref()
const profileSaving = ref(false)
const profileForm = reactive({
  nickName: '',
  sex: 0,
  tel: '',
  cell: '',
  email: '',
  postId: undefined
})

const profileRules = {
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
}

const pwdFormRef = ref()
const pwdSaving = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+]).{8,}$/
const validateConfirm = (_rule, value, cb) => {
  if (value !== pwdForm.newPassword) cb(new Error('两次输入的密码不一致'))
  else cb()
}
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: pwdRegex, message: '密码需8位以上，包含大写、小写、数字和特殊字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

async function loadProfile() {
  const info = await getUserInfo()
  auth.setUserInfo(info)
  profileForm.nickName = info.nickName || ''
  profileForm.sex = info.sex ?? 0
  profileForm.tel = info.tel || ''
  profileForm.cell = info.cell || ''
  profileForm.email = info.email || ''
  profileForm.postId = info.postId
}

async function handleSaveProfile() {
  await profileFormRef.value.validate()
  profileSaving.value = true
  try {
    await updateUser(auth.userId, { ...profileForm })
    auth.nickName = profileForm.nickName
    ElMessage.success('保存成功')
  } finally {
    profileSaving.value = false
  }
}

async function handleChangePwd() {
  await pwdFormRef.value.validate()
  pwdSaving.value = true
  try {
    await changeMyPassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    auth.doLogout()
    menu.reset()
    router.replace('/login')
  } finally {
    pwdSaving.value = false
  }
}

onMounted(() => loadProfile())
</script>

<style scoped lang="scss">
.center-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.center-top {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info {
  h3 {
    margin: 0 0 8px;
    font-size: 20px;
  }
}
.center-cards {
  display: flex;
  gap: 16px;
}
.profile-card, .password-card {
  flex: 1;
}
</style>
