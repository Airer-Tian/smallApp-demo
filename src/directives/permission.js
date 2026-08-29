import { useAuthStore } from '@/store/auth'

export default {
  mounted(el, binding) {
    const auth = useAuthStore()
    if (binding.value && !auth.hasPerm(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
