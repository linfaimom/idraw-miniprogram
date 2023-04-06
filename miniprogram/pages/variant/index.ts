// index.ts
import WeCropper from '../../libs/we-cropper/we-cropper.js'
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width
Page({
  cropper: <any>{},
  data: {
    hideCropperView: true,
    cropperOpt: {
      id: 'cropper', // 用于手势操作的canvas组件标识符
      targetId: 'targetCropper', // 用于用于生成截图的canvas组件标识符
      pixelRatio: device.pixelRatio, // 传入设备像素比
      width,  // 画布宽度
      height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 256) / 2, // 裁剪框x轴起点
        y: (width - 256) / 2, // 裁剪框y轴期起点
        width: 256, // 裁剪框宽度
        height: 256 // 裁剪框高度
      },
    },
    dailyLimits: 10,
    currentUsages: 0,
    fileList: <any>[],
    number: 1,
    size: "256x256",
    loading: false,
    images: []
  },
  onLoad() {
    const { cropperOpt } = this.data
    this.cropper = new WeCropper(cropperOpt)
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
  // 图片上传前校验
  onImageOversize(e: any) {
    wx.showToast({
      title: '不要超4M哦～',
      icon: 'error',
      duration: 1500
    })
    return
  },
  // 图片上传处理
  onImageUpload(e: any) {
    const { file } = e.detail
    const { fileList = [] } = this.data
    fileList.push({ ...file })
    this.setData({ fileList })
    this.cropper.pushOrigin(file.url)
    this.setData({
      hideCropperView: false
    })
  },
  touchStart(e: any) {
    this.cropper.touchStart(e)
  },
  touchMove(e: any) {
    this.cropper.touchMove(e)
  },
  touchEnd(e: any) {
    this.cropper.touchEnd(e)
  },
  generateCropperImage(e: any) {
    const { fileList } = this.data
    this.cropper.getCropperImage((tempFilePath: string) => {
      fileList.length = 0
      fileList.push({ "url": tempFilePath, "status": "loading" })
      this.setData({
        hideCropperView: true,
        fileList: fileList
      })
      // 上传至服务端
      let _this = this
      wx.uploadFile({
        url: getApp().globalData.backendUrl + "/api/images",
        name: "file",
        filePath: tempFilePath,
        formData: {
          "user": getApp().globalData.openId
        },
        success(res: any) {
          let data = JSON.parse(res.data)
          if (data.code !== 200) {
            console.error(data.msg);
            wx.showToast({
              title: '请重新上传哦～',
              icon: 'error',
              duration: 1500
            })
            return
          }
          fileList.length = 0
          fileList.push({ "url": tempFilePath, "status": "done", "path": data.data })
          _this.setData({ fileList });
        }
      })
    })
  },
  // 删除图片处理
  onImageDelete(e: any) {
    this.setData({ fileList: [] });
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
      url: getApp().globalData.backendUrl + "/api/images/variations",
      method: "POST",
      data: {
        "user": getApp().globalData.openId,
        "n": _this.data.number,
        "size": _this.data.size,
        "filePath": _this.data.fileList[0].path
      },
      success(res: any) {
        if (res.data.code !== 200) {
          console.error(res.data.msg);
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
        console.error(err)
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
