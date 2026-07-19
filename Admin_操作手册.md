# 初级会计实务练习平台 — 管理员操作手册

---

## 一、服务启动

### 1.1 本地开发启动
```bash
cd /Volumes/OpenCode/Claude\ Code/Fico
npm install        # 首次需安装依赖
npm run dev        # 启动开发服务器
```
启动后访问 `http://localhost:3000`

### 1.2 生产环境启动
```bash
cd /Volumes/OpenCode/Claude\ Code/Fico
npm install
npm run build      # 构建生产版本
npm start          # 启动生产服务器（默认端口 3000）
```

### 1.3 云服务器部署（推荐）
```bash
# 首次部署
ssh root@你的服务器IP
apt install -y nodejs git nginx
npm install -g pm2
git clone git@github.com:FreeKa1/Fico_test.git /opt/fico
cd /opt/fico
npm install
npm run build
pm2 start npm --name "fico" -- start
pm2 save
pm2 startup

# 后续更新
ssh root@你的服务器IP "cd /opt/fico && git pull && npm install && npm run build && pm2 restart fico"
```

### 1.4 配置 Nginx（可选）
```nginx
server {
    listen 80;
    server_name 你的域名;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 1.5 SSL 证书（可选）
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d 你的域名
```

---

## 二、管理后台

### 2.1 访问地址
```
http://你的域名或IP/admin/login
```

### 2.2 管理员账号
| 用户名 | 密码 |
|--------|------|
| admin | admin123 |

### 2.3 管理后台功能

| 功能 | 说明 |
|------|------|
| **题库统计** | 显示当前题库总量 |
| **用户统计** | 显示注册用户数和已禁用数 |
| **用户列表** | 查看所有用户的用户名、密码、手机号、注册时间、最后登录时间、在线时长 |
| **密码查看** | 点击「查看」按钮切换明文/星号 |
| **禁用用户** | 点击「禁用」禁止该用户登录（被禁用用户登录时提示「该账号已被禁用」） |
| **解禁用户** | 点击「解禁」恢复该用户的登录权限 |
| **删除用户** | 点击「删除」移除该用户（有确认弹窗，不可恢复） |
| **刷新** | 点击表格右上角「刷新」重新加载最新数据 |

### 2.4 数据存储说明
- 所有用户数据存储在浏览器的 `localStorage` 中
- 每个浏览器独立存储，换浏览器或清除缓存会丢失数据
- 密码当前以**明文**存储，后续可接入加密方案
- 题库存储在 `data/questions.json` 文件中

---

## 三、题库管理

### 3.1 题库位置
```
data/questions.json
```

### 3.2 题目格式
```json
{
  "id": "q0001",
  "type": "single",
  "category": "asset",
  "chapter": "ch03",
  "stem": "题干内容...",
  "options": [
    {"label": "A", "text": "选项A"},
    {"label": "B", "text": "选项B"},
    {"label": "C", "text": "选项C"},
    {"label": "D", "text": "选项D"}
  ],
  "answers": ["A"],
  "explanation": "解析内容..."
}
```

### 3.3 字段说明
| 字段 | 说明 |
|------|------|
| `id` | 唯一标识 |
| `type` | 题型：`single`(单选)、`multi`(多选)、`indefinite`(不定项) |
| `category` | 分类：`asset`(资产)、`liability`(负债)、`pl`(损益)、`other`(其他) |
| `chapter` | 教材章节（ch01-ch08，供参考） |
| `stem` | 题干 |
| `options` | 选项数组，label 为 A/B/C/D |
| `answers` | 正确答案数组（单选1个，多选多个） |
| `explanation` | 解析 |
| `material` | （不定项选填）案例材料 |

### 3.4 扩充题库
推荐用 Python 脚本批量生成，避免手动编辑 JSON 格式错误：
```python
import json

with open('data/questions.json', 'r') as f:
    questions = json.load(f)

# 添加新题目
questions.append({
    "id": "new001",
    "type": "single",
    "category": "asset",
    "chapter": "ch03",
    "stem": "你的题干",
    "options": [
        {"label": "A", "text": "选项A"},
        {"label": "B", "text": "选项B"},
        {"label": "C", "text": "选项C"},
        {"label": "D", "text": "选项D"}
    ],
    "answers": ["A"],
    "explanation": "解析"
})

with open('data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

# 验证
with open('data/questions.json', 'r', encoding='utf-8') as f:
    json.load(f)
print(f"验证通过，共 {len(questions)} 题")
```

---

## 四、常用操作速查

| 操作 | 命令/路径 |
|------|----------|
| 启动服务 | `npm run dev` |
| 构建生产版 | `npm run build` |
| 访问用户端 | `http://localhost:3000` |
| 管理后台 | `http://localhost:3000/admin/login` |
| 题库文件 | `data/questions.json` |
| 用户数据 | 浏览器 localStorage（key: `fico_users`） |
| 停止服务 | `Ctrl+C` 或 `pm2 stop fico` |
| 查看日志 | `pm2 logs fico` |
| 重启服务 | `pm2 restart fico` |
| 推送代码 | `git add . && git commit -m "更新" && git push` |

---

## 五、注意事项
1. 用户数据存储在浏览器 localStorage 中，不同设备/浏览器数据不互通
2. 密码明文存储，**不要把管理后台暴露在公网**，或尽快接入加密
3. 不要删除 `admin` 用户，否则无法登录管理后台
4. 修改 `questions.json` 后开发服务器会自动热更新，生产环境需重新 `npm run build`
