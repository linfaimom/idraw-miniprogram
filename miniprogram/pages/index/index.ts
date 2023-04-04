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
    images: ["https://bountycdn.azureedge.net/~/media/b9bedc08353044c5b7e354858f0c4db1.ashx?la=en&rv=26a2b311-b7b5-49bf-8949-d05b6ab5f712"]
  },
  onLoad() {
    this.updateDailyLimits()
    if (app.globalData.openId !== "unknown") {
      this.updateCurrentUsages()
    } else {
      console.log("page wait to fetch openId")
      app.watch(() => this.updateCurrentUsages())
    }
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
  onImageClick(e: any) {
    let url = e.currentTarget.dataset.src
    wx.previewImage({
      current: url,
      urls: this.data.images
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
