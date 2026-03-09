<script setup>
const props = defineProps({
  user: {
    type: [Object, String],
    default: null
  },
  src: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  sizeClass: {
    type: String,
    default: 'h-8 w-8'
  }
})

const { getUserName, getUser } = useUsers()

const fullUser = computed(() => {
    return getUser(props.user) || props.user
})

const displayName = computed(() => {
    if (props.name) return props.name
    return getUserName(props.user)
})

const mediaAvatar = computed(() => {
    const u = fullUser.value
    if (u && typeof u === 'object' && u.avatar && typeof u.avatar === 'object') {
        return u.avatar
    }
    return null
})

const avatarUrl = computed(() => {
    if (props.src) return props.src
    const u = fullUser.value
    // Si l'avatar est juste une string (lien classique)
    if (u && typeof u === 'object' && u.avatar && typeof u.avatar === 'string') {
        return u.avatar
    }
    return null
})

const initial = computed(() => {
    const name = displayName.value
    return name ? name.charAt(0).toUpperCase() : '?'
})

const bgColor = computed(() => {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
        'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
        'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
        'bg-pink-500', 'bg-rose-500'
    ]
    if (!displayName.value || displayName.value === 'Anonyme' || displayName.value === 'Inconnu') return 'bg-slate-600'
    
    let hash = 0
    for (let i = 0; i < displayName.value.length; i++) {
        hash = displayName.value.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
})

const textSizeClass = computed(() => {
    if (props.sizeClass.includes('w-32') || props.sizeClass.includes('h-32')) return 'text-4xl'
    if (props.sizeClass.includes('w-16') || props.sizeClass.includes('h-16')) return 'text-xl'
    if (props.sizeClass.includes('w-12') || props.sizeClass.includes('h-12')) return 'text-lg'
    if (props.sizeClass.includes('w-10') || props.sizeClass.includes('h-10')) return 'text-sm'
    return 'text-xs'
})
</script>

<template>
    <div 
        :class="[sizeClass, 'rounded-full flex items-center justify-center shrink-0 overflow-hidden text-white font-bold select-none ring-1 ring-white/10 relative', (avatarUrl || mediaAvatar) ? 'bg-black' : bgColor]"
    >
        <AuthImage 
            v-if="mediaAvatar"
            :media="mediaAvatar"
            :alt="displayName"
            imgClass="w-full h-full object-cover absolute inset-0"
        />
        <img 
            v-else-if="avatarUrl" 
            :src="avatarUrl" 
            :alt="displayName" 
            class="w-full h-full object-cover absolute inset-0"
        >
        <span v-else :class="[textSizeClass, 'relative z-10']">
            {{ initial }}
        </span>
    </div>
</template>
