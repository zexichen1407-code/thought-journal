# 发布到 App Store — 进度与步骤

## 已经做好的（代码层）

- ✅ 用 **Capacitor 7** 把网页 app 包成原生 iOS 壳，界面/配色/逻辑全部复用。
- ✅ 录音改成**双模式**:浏览器里仍用 Web Speech;原生 iOS app 里用 `@capacitor-community/speech-recognition`(iOS 原生语音识别)。代码在 `src/hooks/useSpeechRecognition.ts`。
- ✅ iOS 原生工程已生成:`ios/App`(Xcode 工程,含 Podfile)。
- ✅ 隐私权限已写入 `ios/App/App/Info.plist`(麦克风、语音识别用途说明)。
- ✅ App 名:思考记录;Bundle ID:`com.zexichen.thoughtjournal`(可改,但要和 Apple 后台登记的一致)。

## 只能你做的（需要你的身份/钱/账号）

### 1. Apple 开发者账号（$99/年,必须)
- 去 https://developer.apple.com/programs/ 注册 Apple Developer Program。
- 用你的 Apple ID + 银行卡,$99/年。审核个人账号通常 1–2 天。
- 这是上架的硬门槛,没有它做不了。

### 2. 之后我帮你配云端构建(你在 Windows,需要云 Mac)
推荐 **Codemagic**(对 Windows 用户最省事,免费额度每月 500 分钟):
- 把项目推到 GitHub(私有仓库即可)。
- 在 codemagic.io 用 GitHub 登录、选这个仓库。
- 连接你的 Apple Developer 账号(用 App Store Connect API key),Codemagic 自动管理签名证书。
- 它自动:装 CocoaPods → 构建 → 出 `.ipa` → 上传到 TestFlight / App Store Connect。

### 3. 在 App Store Connect 建 app + 提交审核
- https://appstoreconnect.apple.com 新建 app,Bundle ID 填 `com.zexichen.thoughtjournal`。
- 填:名称、描述、分类、**隐私政策网址**(必须有一个可访问的网页)、截图(几张手机截图)。
- 上传构建版本(Codemagic 推上来的)→ 提交审核。苹果人工审核一般几天。

## 还差的素材(我可以帮做)
- **App 图标**(1024×1024 + 各尺寸)——用 `@capacitor/assets` 从一张源图生成,我可以做一版极简图标。
- **启动屏**。
- **隐私政策网页**——内容简单(说明:录音转文字在本机/发给 AI 分析、数据只存本地),我可以起草,你挂到一个网址上。

## 重要提醒
- **原生语音识别我没法在 Windows 上测**——要等第一次真机/TestFlight 构建出来,在你 iPhone 上跑一次才能确认。逻辑我按苹果的接口写好了,但可能需要根据真机表现微调。
- 上架后要持续:$99/年续费;系统/依赖更新时重新构建。

## 下一步
**你先去注册 Apple 开发者账号。** 拿到后告诉我,我就:把项目推 GitHub → 配 Codemagic → 出第一个 TestFlight 包,装到你 iPhone 上先内测语音,跑通再提交上架。
