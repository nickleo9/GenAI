# Claude Telegram Bot 自動恢復部署指南

## 快速部署

在 OCI 伺服器上執行：

```bash
# 1. 先把這個資料夾上傳到伺服器
scp -r oci-deploy/ ubuntu@150.230.213.93:/home/ubuntu/oci-deploy/

# 2. SSH 到伺服器
ssh ubuntu@150.230.213.93

# 3. 先停掉目前前景運行的 claude（按 Ctrl+C）

# 4. 執行部署腳本
cd /home/ubuntu/oci-deploy
chmod +x *.sh
./setup-auto-recovery.sh
```

## 保護層級

| 層級 | 機制 | 保護範圍 |
|------|------|----------|
| 1 | PM2 自動重啟 | 進程崩潰 |
| 2 | systemd + PM2 | 伺服器重開機 |
| 3 | 健康檢查腳本 | MCP 插件斷線、進程卡住 |
| 4 | crontab 每2分鐘 | 定時巡邏 |

## 健康檢查項目

1. **PM2 進程狀態** - 確認 claude-telegram 為 online
2. **Claude 進程存在** - 確認 claude CLI 在運行
3. **Bun Worker 存在** - 確認 Telegram worker 在運行
4. **網路連線** - 確認 worker 有連到 Telegram API (149.154.x.x / 91.108.x.x)
5. **訊息堆積** - 確認 inbox 沒有超過 5 分鐘未處理的訊息

## 常用指令

```bash
# 查看 bot 狀態
pm2 status

# 查看即時日誌
pm2 logs claude-telegram

# 查看健康檢查日誌
tail -f ~/telegram-health.log

# 手動重啟
pm2 restart claude-telegram

# 手動執行健康檢查
/home/ubuntu/health-check-telegram.sh

# 查看 crontab
crontab -l
```

## 注意事項

- MCP 插件首次啟動後可能需要手動 Reconnect 一次
- 如果健康檢查頻繁重啟，檢查 `~/telegram-health.log`
- Bot Token 在 `~/.claude/channels/telegram/.env`
