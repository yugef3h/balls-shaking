

import axios from '@/utils/axios'
const Utils = {
  get(url, data) {
    if (data === undefined) {
      return axios
        .get(url)
        .then(result => Utils.router(result))
        .catch(error => Utils.router(error))
    } else {
      return axios
        // 待优化：  字符串和对象的判断，字符串还要校验是否规范
        .get(url, {
          params: data
        })
        .then(result => Utils.router(result))
        .catch(error => Utils.router(error))
    }
  },
  post(url, data) {
    return axios
      .post(url, data)
      .then(result => Utils.router(result))
      .catch(error => Utils.router(error))
  },
  router(res) {
    let { data = undefined, status } = res
    // 服务器返回status非成功200
    if (data === undefined) return Utils.ajaxErr(res)
    // 后台code 200 undefined 500， PS：code500归到服务器status中
    if (data.code === 200 || data.code === undefined) {
      return Utils.commonAjaxStatus(data)
    } else {
      return Utils.ajaxErr(res)
    }
  },
  commonAjaxStatus(res) {
    return new Promise(function (resolve, reject) {
      return resolve(res)
    })
  },
  ajaxErr(error) {
    localStorage.setItem('error', JSON.stringify(error))
    let { response = undefined, code = undefined, status = undefined } = error
    if (response) {
      response.status === 401 ? window.location.href = '/' : console.log(error)
    } else if (code) {
    } else if (status) {
    } else {
    }
    return Promise.reject(error)
  },
}

const post = (url) => {
  return function (obj = {}) {
    let address = ''
    let keyArray = Object.keys(obj)
    if (Object.prototype.toString.call(url).indexOf('String') !== -1) {
      address = url
    } else {
      let id = null;
      for (let key of keyArray) {
        if (key.toLocaleLowerCase().indexOf('id') !== -1) {
          id = key;
          break;
        }
      }
      address = obj && obj[id] ? url[1] : url[0]
    }
    // if (Object.prototype.toString.call(obj).indexOf('Object') !== -1) {}
    return keyArray.length === 1 ? Utils.post(`${address}?${keyArray[0]}=${obj[[keyArray[0]]]}`) : Utils.post(address, obj)
  }
}

const get = (url) => {
  return function (obj) {
    return Utils.get(url, obj)
  }
}

const BasicService = {
  findPersonnelPage: get('/personnel/findPersonnelPage'),
  updatePersonnelFace: post('/personnel/updatePersonnelFace'),
  updatePersonnelFinger: post('/personnel/updatePersonnelFinger'),
  login: post('/employee/login'),
  refToken: post('/employee/refreshToken'),
  upload: post('/upload'),
}

export default BasicService