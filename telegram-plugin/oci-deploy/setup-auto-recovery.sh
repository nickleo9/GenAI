#!/bin/bash
# 一鍵部署 Claude Telegram Bot 自動恢復系統
# 在 OCI 伺服器上執行此腳本即可完成所有設定

set -e

echo "=== Claude Telegram Bot 自動恢復系統部署 ==="

# 1. 複製啟動腳本
echo "[1/5] 安裝啟動腳本..."
cp -f start-claude-telegram.sh /home/ubuntu/start-claude-telegram.sh
chmod +x /home/ubuntu/start-claude-telegram.sh

# 2. 複製健康檢查腳本
echo "[2/5] 安裝健康檢查腳本..."
cp -f health-check-telegram.sh /home/ubuntu/health-check-telegram.sh
chmod +x /home/ubuntu/health-check-telegram.sh

# 3. 設定 crontab（每 2 分鐘執行健康檢查）
echo "[3/5] 設定 crontab 定時健康檢查..."
CRON_JOB="*/2 * * * * /home/ubuntu/health-check-telegram.sh"
(crontab -l 2>/dev/null | grep -v "health-check-telegram" ; echo "$CRON_JOB") | crontab -
echo "    已新增: $CRON_JOB"

# 4. 確保 PM2 systemd 開機啟動已設定
echo "[4/5] 確認 PM2 開機自啟..."
if systemctl is-enabled pm2-ubuntu 2>/dev/null; then
    echo "    PM2 systemd 服務已啟用 ✓"
else
    echo "    設定 PM2 開機自啟..."
    pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
    sudo systemctl enable pm2-ubuntu 2>/dev/null || true
fi

# 5. 啟動 bot（如果未運行）
echo "[5/5] 檢查並啟動 Bot..."
PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for p in data:
        if p.get('name') == 'claude-telegram':
            print(p.get('pm2_env', {}).get('status', 'unknown'))
            break
    else:
        print('not_found')
except:
    print('error')
" 2>/dev/null)

if [ "$PM2_STATUS" = "online" ]; then
    echo "    Claude Telegram Bot 已在運行中 ✓"
else
    echo "    啟動 Claude Telegram Bot..."
    pm2 delete claude-telegram 2>/dev/null || true
    pkill -9 -f "bun.*telegram" 2>/dev/null || true
    pkill -9 -f "claude.*channels.*telegram" 2>/dev/null || true
    sleep 2
    pm2 start /home/ubuntu/start-claude-telegram.sh \
        --name claude-telegram \
        --cwd /home/ubuntu \
        --restart-delay 10000 \
        --max-restarts 50 \
        --exp-backoff-restart-delay 5000
    pm2 save
    echo "    Bot 已啟動 ✓"
fi

echo ""
echo "=== 部署完成 ==="
echo ""
echo "保護機制："
echo "  ✓ PM2 進程管理 - 崩潰自動重啟"
echo "  ✓ systemd 開機自啟 - 伺服器重開機自動恢復"
echo "  ✓ 健康檢查 - 每 2 分鐘偵測異常並自動修復"
echo "  ✓ 網路連線偵測 - MCP 插件斷線自動重啟"
echo "  ✓ 訊息堆積偵測 - Claude 卡住自動重啟"
echo ""
echo "常用指令："
echo "  pm2 logs claude-telegram    # 查看即時日誌"
echo "  pm2 status                  # 查看進程狀態"
echo "  tail -f ~/telegram-health.log  # 查看健康檢查日誌"
echo "  pm2 restart claude-telegram # 手動重啟"
