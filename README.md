# 思考记录 (thought-journal)

用语音记录每天的思考,AI 跨多天提炼你反复在想的**主题**,并追踪每个主题下观点是怎么随时间演变的。

## 功能

- **记录**:点麦克风说话,浏览器自带语音识别实时把中文转成文字(免费,无需 key);也能手动打字。
- **历史**:查看、编辑、删除所有记录。
- **主题**:DeepSeek 读取你全部记录,提炼反复出现的主题 + 核心观点 + 观点演变时间线。
- **设置**:填 DeepSeek API key、选模型。

记录目前存在浏览器本地(localStorage)。

## 技术栈

- Vite + React + TypeScript
- Web Speech API(`zh-CN`)做语音转写
- DeepSeek API(OpenAI 兼容,浏览器直连,JSON 输出)做主题分析

## 本地运行

```bash
npm install
npm run dev
```

然后用 **Chrome** 打开 `http://localhost:5173`(语音识别需要麦克风权限,桌面 Chrome 上最稳)。

## 用主题分析前

1. 去 [platform.deepseek.com](https://platform.deepseek.com) 注册并创建 API key(新账号送 500 万免费 token,30 天内有效)。
2. 在 app 的「设置」里粘贴 key、选模型(默认 `deepseek-chat`)。
3. 攒几条记录后,到「主题」点「生成主题分析」。

key 只存在你本地浏览器,不会上传到任何服务器。

## 构建

```bash
npm run build
```
