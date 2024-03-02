// index.ts
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    easyMode: true,
    dailyLimits: 0,
    currentUsages: 0,
    text: "",
    textAreaFocused: false,
    number: 1,
    model: "dall-e-3",
    size: "1024x1024",
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
  onTextAreaTap(e: any) {
    this.setData({
      textAreaFocused: true
    })
  },
  // 文字输入处理
  onTextChange(e: any) {
    this.setData({
      text: e.detail
    })
  },
  onInfoClick(e: any) {
    Dialog.alert({
      title: '模式介绍',
      messageAlign: "left",
      message: "懒人模式：默认开启，推荐。直接调用 OpenAI DALL-E API 生成，速度快，但效果相对比较普通。\n\n进阶模式：爱折腾可以玩。使用 Stable Diffusion 及各类衍生模型进行绘图，需要较长时间，但效果会非常逼真！",
      theme: 'round-button',
      confirmButtonText: '知道啦！'
    })
  },
  onModeChange(e: any) {
    Dialog.alert({
      title: '哎呀，暂未上线哦 🤪',
      messageAlign: "left",
      message: "恭喜你发现新天地！可惜我还没做好哈哈～后续的高级模式将会使用 Stable Diffusion 生成更逼真的图片哦，敬请期待啦！",
      theme: 'round-button',
      confirmButtonText: '知道啦！'
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
        "model": _this.data.model,
        "n": _this.data.number,
        "size": _this.data.size,
        "prompt": _this.data.text
      },
      success(res: any) {
        if (res.data.code !== 200) {
          Dialog.alert({
            title: '糟糕，出错被发现了🤪',
            messageAlign: "left",
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
          messageAlign: "left",
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
