// index.ts

const app = getApp()

Page({
  data: {
    dailyLimits: 10,
    currentUsages: 0,
    text: "",
    number: 1,
    size: "256x256",
    loading: false,
    images: []
  },
  onLoad() {
    this.updateDailyLimits()
    // TODO 偶发获取不到 openId 的状况，待处理
    this.updateCurrentUsages()
  },
  updateDailyLimits() {
    let _this = this
    wx.request({
      url: "https://idraw.doulikeme4i10.cn/api/images/dailyLimits",
      success(res: any) {
        console.log("current dailyLimits fetch: ", res.data)
        _this.setData({
          dailyLimits: res.data.data
        })
      }
    })
  },
  updateCurrentUsages() {
    let _this = this
    wx.request({
      url: "https://idraw.doulikeme4i10.cn/api/images/currentUsages",
      data: {
        openId: app.globalData.openId
      },
      success(res: any) {
        console.log("current usages fetch: ", res.data)
        _this.setData({
          currentUsages: res.data.data
        })
      }
    })
  },
  // 事件处理函数
  onTextChange(e: any) {
    this.setData({
      text: e.detail
    })
  },
  toggleLoading() {
    this.setData({
      loading: !this.data.loading
    })
  },
  postToGenerate(e: any) {
    // 空输入校验
    if (this.data.text === null || this.data.text === "") {
      wx.showToast({
        title: '要输入文字哦～',
        icon: 'error',
        duration: 1500
      })
      return
    }
    // 限额校验
    if (this.data.currentUsages >= this.data.dailyLimits) {
      wx.showToast({
        title: '改天再来玩吧～',
        icon: 'error',
        duration: 1500
      })
      return
    }
    this.toggleLoading()
    let _this = this
    wx.request({
      url: "https://idraw.doulikeme4i10.cn/api/images/generations",
      method: "POST",
      data: {
        "user": app.globalData.openId,
        "n": _this.data.number,
        "size": _this.data.size,
        "prompt": _this.data.text
      },
      success(res: any) {
        console.log(res.data)
        if (res.data.code !== 200) {
          console.log(res.data.msg);
          wx.showToast({
            title: '请重试一下哦～',
            icon: 'error',
            duration: 1500
          })
          return
        }
        _this.setData({
          images: res.data.data
        })
        _this.updateCurrentUsages()
      },
      fail(err) {
        console.log(err)
        wx.showToast({
          title: '请重试一下哦～',
          icon: 'error',
          duration: 1500
        })
        return
      },
      complete() {
        _this.toggleLoading()
      }
    })
  },
})
