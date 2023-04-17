// index.ts
Page({
  data: {
    totalGeneratedNum: 0,
    dailyLimits: 0,
    currentUsages: 0
  },
  onLoad() {
    console.info("user onload")
  },
  onShow() {
    console.info("user onshow")
    if (getApp().globalData.openId !== undefined && getApp().globalData.openId !== "unknown") {
      this.updateTotalGeneratedNum()
      this.updateDailyLimits()
      this.updateCurrentUsages()
    } else {
      console.info("user onshow wait to fetch openId")
      getApp().watch(() => {
        this.updateTotalGeneratedNum()
        this.updateDailyLimits()
        this.updateCurrentUsages()
      })
    }
  },
  updateTotalGeneratedNum() {
    let _this = this
    wx.request({
      url: getApp().globalData.backendUrl + "/api/images/records/count",
      data: {
        openId: getApp().globalData.openId
      },
      success(res: any) {
        console.log("total records count fetch: ", res.data)
        _this.setData({
          totalGeneratedNum: res.data.data
        })
      }
    })
  },
  updateDailyLimits() {
    let _this = this
    wx.request({
      url: getApp().globalData.backendUrl + "/api/images/dailyLimits",
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
      url: getApp().globalData.backendUrl + "/api/images/currentUsages",
      data: {
        openId: getApp().globalData.openId
      },
      success(res: any) {
        console.log("current usages fetch: ", res.data)
        _this.setData({
          currentUsages: res.data.data
        })
      }
    })
  },
  onAskAbout(e) {
    wx.showToast({
      title: '敬请期待哦～',
      icon: 'error',
      duration: 1500
    })
    return
  },
  onAskTurnUpLimits(e) {
    wx.showToast({
      title: '敬请期待哦～',
      icon: 'error',
      duration: 1500
    })
    return
  }
})
