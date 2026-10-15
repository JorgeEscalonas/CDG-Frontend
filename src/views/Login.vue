<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" autocomplete="off">
      <img src="/img/logotipo.png" alt="logo de la casa de los granos">
      <h1>Bienvenido</h1>
      
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div class="input-group">
        <div class="input-container">
          <input 
            type="text" 
            v-model="form.nombreU" 
            placeholder="Usuario"
            required
          >
        </div>
        <div class="input-container">
          <input 
            type="password" 
            v-model="form.contrasena" 
            placeholder="Contraseña"
            required
          >
        </div>
        <button 
          type="submit" 
          class="btn" 
          :disabled="loading"
        >
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  nombreU: '',
  contrasena: ''
})

const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (route.query.expired === '1') {
    error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value)
    if (result.success) {
      router.push({ name: 'dashboard' })
    } else {
      error.value = result.message || 'Nombre de usuario o contraseña incorrectos.'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Ocurrió un error al intentar iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-image: url("/img/fondo.JPG");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
}

form {
    padding: 40px 50px;
    width: 400px;
    color: #fff;
    text-align: center;
    border-radius: 25px;

    /* Liquid Glass Effect */
    background: rgba(0, 0, 0, 0.1);
    /* Darker transparent base */
    backdrop-filter: blur(5px) saturate(180%);
    -webkit-backdrop-filter: blur(5px) saturate(180%);

    /* Borders for 'Light' effect */
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    border-left: 1px solid rgba(255, 255, 255, 0.3);

    /* Depth and Shadow */
    box-shadow:
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        inset 0 0 20px rgba(255, 255, 255, 0.05);
}

form img {
    width: 250px;
    margin-bottom: 15px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

h1 {
    font-weight: 300;
    letter-spacing: 1px;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    font-weight: 500;
}

.input-container {
    position: relative;
    margin-bottom: 20px;
}

.input-container > input {
    padding: 15px 20px;
    width: 100%;
    border-radius: 35px;
    border: 2px solid #b57e10;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-weight: 500;
}

.input-container > input:focus {
    box-shadow: 0 0 15px rgba(181, 126, 16, 0.3);
    background: rgba(255, 255, 255, 0.1);
}

::placeholder {
    color: #ffefff;
    font-size: 16px;
}

.btn {
    background: linear-gradient(135deg, #b57e10 0%, #975f0c 100%);
    padding: 15px 50px;
    width: 100%;
    border: 0;
    border-radius: 25px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;

    /* Button Depth */
    box-shadow:
        0 4px 15px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #c68e17 0%, #a86b0e 100%);
    transform: translateY(-2px);
    box-shadow:
        0 6px 20px rgba(181, 126, 16, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn:active:not(:disabled) {
    transform: translateY(1px);
}

.btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error {
    color: #fff;
    font-size: 15px;
    margin-bottom: 20px;
    font-weight: 500;
    background: rgba(250, 1, 1, 0.3);
    padding: 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 0, 0, 0.2);
}

@media(max-width:991px) {
    .login-page {
        padding: 20px;
    }

    form {
        width: 100%;
        padding: 30px 20px;
    }
}
</style>


