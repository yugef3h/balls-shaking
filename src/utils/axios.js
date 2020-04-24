import axios from 'axios'
axios.defaults.baseURL = process.env.VUE_APP_BASE_API
axios.defaults.timeout = 20000
axios.defaults.withCredentials = false
axios.defaults.retry = 2
axios.defaults.retryDelay = 1000
const pending = []
const CancelToken = axios.CancelToken
let refreshSubscribers = []
const removePending = config => {
  for (const p in pending) {
    if (pending[p].u === config.url + '&' + config.method) {
      pending[p].f()
      pending.splice(p, 1)
    }
  }
}

axios.interceptors.request.use(
  config => {
    removePending(config)
    config.cancelToken = new CancelToken(c => {
      pending.push({ u: config.url + '&' + config.method, f: c })
    })
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)
axios.interceptors.response.use(
  res => {
    removePending(res.config)
    return res
  },
  err => {
    return Promise.reject(err)
  }
)

export default axios