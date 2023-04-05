// index.ts
Page({
  data: {
    dailyLimits: 10,
    currentUsages: 0,
    fileList: <any>[],
    number: 1,
    size: "256x256",
    loading: false,
    images: []
  },
  onLoad() {
    this.updateDailyLimits()
    if (getApp().globalData.openId !== "unknown") {
      this.updateCurrentUsages()
    } else {
      console.error("page wait to fetch openId")
      getApp().watch(() => this.updateCurrentUsages())
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
  // 图片上传处理
  onImageUpload(e: any) {
    const { file } = e.detail
    const { fileList = [] } = this.data;
    fileList.push({ ...file })
    this.setData({ fileList });
  },
  // 删除图片处理
  onImageDelete(e: any) {
    this.setData({ fileList: [] });
  },
  toggleLoading() {
    this.setData({
      loading: !this.data.loading
    })
  },
  postToGenerate(e: any) {
    // 空输入校验
    if (this.data.fileList === null || this.data.fileList.length === 0) {
      wx.showToast({
        title: '要上传图片哦～',
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
      url: "https://idraw.doulikeme4i10.cn/api/images/variations",
      method: "POST",
      data: {
        "user": getApp().globalData.openId,
        "n": _this.data.number,
        "size": _this.data.size,
        "image": _this.data.uploadedImage
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
