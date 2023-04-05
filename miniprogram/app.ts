// app.ts
App({
  globalData: {
    "openId": "unknown"
  },
  onLaunch() {
    let _this = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.request({
            url: 'https://idraw.doulikeme4i10.cn/api/wx/login',
            data: {
              code: res.code
            },
            success(resp: any) {
              console.log(resp)
              if (resp.data.code === 200) {
                _this.globalData.openId = resp.data.data.openid
              }
            },
            complete() {
              console.log("current openid: ", _this.globalData.openId)
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
    })
  },
  watch(fn: any) {
    var obj = this.globalData
    Object.defineProperty(obj, 'openId', {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this._openId = value;
        fn(value);
      },
      get: function () {
        return this._openId
      }
    })
  },
})