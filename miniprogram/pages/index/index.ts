// index.ts
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    dailyLimits: 0,
    currentUsages: 0,
    text: "",
    number: 1,
    size: "512x512",
    loading: false,
    images: <any>[]
  },
  onLoad() {
    console.info("index onload")
  },
  onShow() {
    console.info("index onshow")
    if (getApp().globalData.openId !== undefined && getApp().globalData.openId !== "unknown") {
      this.updateDailyLimits()
      this.updateCurrentUsages()
    } else {
      console.info("index onshow wait to fetch openId")
      getApp().watch(() => {
        this.updateDailyLimits()
        this.updateCurrentUsages()
      })
    }
  },
  onShareAppMessage() {
    return {
      title: "震惊！！用 ChatGPT 画出的图居然。。。"
    }
  },
  onShareTimeline() {
    return {
      title: "震惊！！用 ChatGPT 画出的图居然。。。"
    }
  },
  updateDailyLimits() {
    let _this = this
    wx.request({
      url: getApp().globalData.backendUrl + "/api/images/dailyLimits",
      data: {
        openId: getApp().globalData.openId
      },
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
  // 文字输入处理
  onTextChange(e: any) {
    this.setData({
      text: e.detail
    })
  },
  // 图片点击处理
  onImageClick(e: any) {
    wx.previewImage({
      urls: this.data.images,
      current: e.currentTarget.dataset.src
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
      url: getApp().globalData.backendUrl + "/api/images/generations",
      method: "POST",
      data: {
        "user": getApp().globalData.openId,
        "n": _this.data.number,
        "size": _this.data.size,
        "prompt": _this.data.text
      },
      success(res: any) {
        if (res.data.code !== 200) {
          Dialog.alert({
            title: '糟糕，出错被发现了🤪',
            message: res.data.msg,
            theme: 'round-button',
            confirmButtonText: '知道啦！这就去重试一下～'
          })
          return
        }
        let result: string[] = res.data.data
        result = result.map(item => {
          return getApp().globalData.backendUrl + "/api/images?fileName=" + item
        })
        _this.setData({
          images: result
        })
        _this.updateCurrentUsages()
      },
      fail(err) {
        Dialog.alert({
          title: '糟糕，出错被发现了🤪',
          message: err.errMsg,
          theme: 'round-button',
          confirmButtonText: '知道啦！这就去重试一下～'
        })
        return
      },
      complete() {
        _this.toggleLoading()
      }
    })
  },
})
