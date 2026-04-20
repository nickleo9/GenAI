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

---

## tmux 版本部署（不使用 PM2）

若不想裝 PM2，可改用 tmux + cron 的輕量方案。使用的腳本：

- `restart-telegram.sh` — tmux session 不存在時自動重建（含 `--continue --dangerously-skip-permissions --enable-auto-mode`，保留對話記憶並跳過權限確認）
- `health-check-telegram-tmux.sh` — 每 2 分鐘由 cron 觸發，5 層健康檢查 + 每 6 小時強制重啟，防 MCP 假死

### 一次性安裝

```bash
# 在 OCI 伺服器上
cd /tmp/genai-temp   # 已 clone 此 repo 的位置
cp telegram-plugin/oci-deploy/restart-telegram.sh /home/ubuntu/
cp telegram-plugin/oci-deploy/health-check-telegram-tmux.sh /home/ubuntu/
chmod +x /home/ubuntu/restart-telegram.sh /home/ubuntu/health-check-telegram-tmux.sh

# 掛 cron（每 2 分鐘跑一次 health check）
(crontab -l 2>/dev/null | grep -v "health-check-telegram-tmux" ; \
 echo "*/2 * * * * /home/ubuntu/health-check-telegram-tmux.sh") | crontab -

# 首次啟動
/home/ubuntu/restart-telegram.sh
tmux ls   # 應看到 claude-telegram
```

### tmux 版常用指令

```bash
tmux ls                                    # 看 session
tmux attach -t claude-telegram             # 進入 session（Ctrl+b d 離開）
tmux capture-pane -t claude-telegram -p | tail -50  # 看最後畫面
tail -f ~/telegram-health.log              # 健康檢查日誌
tail -f ~/telegram-watchdog.log            # restart 紀錄
/home/ubuntu/health-check-telegram-tmux.sh # 手動觸發一次
```

### 參數一致性重要說明

`restart-telegram.sh` 與 `health-check-telegram-tmux.sh` 的啟動參數必須一致，否則 health check 重啟後行為會跟手動啟動不同（例如失去對話記憶或被卡在權限提示）。修改任一方時務必同步另一方。
