#!/bin/bash
# Claude Telegram Bot 健康檢查腳本
# 功能：
#   1. 檢查 PM2 中 claude-telegram 進程是否存活
#   2. 檢查 bun telegram worker 是否在運行
#   3. 檢查 telegram worker 是否有活躍的網路連線（偵測 MCP 斷線）
#   4. 如果不健康，自動殺掉所有相關進程並重啟

LOG_FILE="/home/ubuntu/telegram-health.log"
STARTUP_SCRIPT="/home/ubuntu/start-claude-telegram.sh"
PM2_PROCESS_NAME="claude-telegram"
MAX_LOG_LINES=1000

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

truncate_log() {
    if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt "$MAX_LOG_LINES" ]; then
        tail -n 500 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
}

kill_all_claude_telegram() {
    log "ACTION: 清理所有 Claude Telegram 相關進程"
    pkill -9 -f "bun.*telegram" 2>/dev/null
    pkill -9 -f "claude.*channels.*telegram" 2>/dev/null
    sleep 2
    pm2 delete "$PM2_PROCESS_NAME" 2>/dev/null
    sleep 1
}

start_bot() {
    log "ACTION: 啟動 Claude Telegram Bot via PM2"
    pm2 start "$STARTUP_SCRIPT" \
        --name "$PM2_PROCESS_NAME" \
        --cwd /home/ubuntu \
        --restart-delay 10000 \
        --max-restarts 50 \
        --exp-backoff-restart-delay 5000
    pm2 save
    log "ACTION: PM2 啟動完成並已儲存"
}

# --- 健康檢查邏輯 ---

truncate_log

# 檢查 1: PM2 進程是否存在且為 online
PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for p in data:
        if p.get('name') == '$PM2_PROCESS_NAME':
            print(p.get('pm2_env', {}).get('status', 'unknown'))
            break
    else:
        print('not_found')
except:
    print('error')
" 2>/dev/null)

if [ "$PM2_STATUS" != "online" ]; then
    log "UNHEALTHY: PM2 進程狀態=$PM2_STATUS (不是 online)"
    kill_all_claude_telegram
    start_bot
    exit 0
fi

# 檢查 2: claude 進程是否存在
CLAUDE_PID=$(pgrep -f "claude.*channels.*telegram" | head -1)
if [ -z "$CLAUDE_PID" ]; then
    log "UNHEALTHY: Claude 進程不存在"
    kill_all_claude_telegram
    start_bot
    exit 0
fi

# 檢查 3: bun telegram worker 是否存在
BUN_PID=$(pgrep -f "bun.*telegram" | head -1)
if [ -z "$BUN_PID" ]; then
    log "UNHEALTHY: Bun Telegram worker 不存在"
    kill_all_claude_telegram
    start_bot
    exit 0
fi

# 檢查 4: bun worker 是否有連到 Telegram API 的網路連線
CONNECTIONS=$(ss -tnp 2>/dev/null | grep "$BUN_PID" | grep -c "149.154\|91.108")
if [ "$CONNECTIONS" -eq 0 ]; then
    # 再等 10 秒確認（可能暫時斷線）
    sleep 10
    CONNECTIONS=$(ss -tnp 2>/dev/null | grep "$BUN_PID" | grep -c "149.154\|91.108")
    if [ "$CONNECTIONS" -eq 0 ]; then
        log "UNHEALTHY: Bun worker 沒有到 Telegram API 的連線 (PID=$BUN_PID)"
        kill_all_claude_telegram
        start_bot
        exit 0
    fi
fi

# 檢查 5: 檢查 inbox 是否有堆積未處理的訊息（超過 5 分鐘未處理 = 可能卡住）
INBOX_DIR="/home/ubuntu/.claude/channels/telegram/inbox"
if [ -d "$INBOX_DIR" ]; then
    OLD_MSGS=$(find "$INBOX_DIR" -type f -mmin +5 2>/dev/null | wc -l)
    if [ "$OLD_MSGS" -gt 3 ]; then
        log "UNHEALTHY: inbox 有 $OLD_MSGS 封超過5分鐘未處理的訊息，Claude 可能卡住"
        kill_all_claude_telegram
        start_bot
        exit 0
    fi
fi

log "HEALTHY: 所有檢查通過 (claude_pid=$CLAUDE_PID, bun_pid=$BUN_PID, connections=$CONNECTIONS)"
