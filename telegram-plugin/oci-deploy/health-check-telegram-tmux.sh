#!/bin/bash
# Claude Telegram Bot 健康檢查腳本 (tmux 版本 v2)
#
# v2 改進：
#   - 新增 bun worker 網路連線檢查（偵測假死）
#   - 新增強制定期重啟（每 6 小時）
#   - 重啟後自動清理 inbox 舊訊息，避免死循環

set -u

LOG_FILE="/home/ubuntu/telegram-health.log"
TMUX_SESSION="claude-telegram"
INBOX_DIR="/home/ubuntu/.claude/channels/telegram/inbox"
CLAUDE_BIN="/home/ubuntu/.local/bin/claude"
MAX_LOG_LINES=1000
UPTIME_FILE="/tmp/claude-telegram-start-time"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

truncate_log() {
    if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt "$MAX_LOG_LINES" ]; then
        tail -n 500 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
}

clean_inbox() {
    if [ -d "$INBOX_DIR" ]; then
        find "$INBOX_DIR" -type f -mmin +5 -delete 2>/dev/null || true
    fi
}

restart_tmux_session() {
    local reason="$1"
    log "RESTART: $reason"

    pkill -9 -f "bun.*telegram" 2>/dev/null || true
    pkill -9 -f "claude.*channels.*telegram" 2>/dev/null || true
    tmux kill-session -t "$TMUX_SESSION" 2>/dev/null || true
    sleep 3

    clean_inbox

    tmux new-session -d -s "$TMUX_SESSION"
    sleep 1
    tmux send-keys -t "$TMUX_SESSION" \
        "$CLAUDE_BIN --channels plugin:telegram@claude-plugins-official --dangerously-skip-permissions --enable-auto-mode" Enter

    date +%s > "$UPTIME_FILE"
    log "RESTART: tmux session 已重建，inbox 已清理"
}

# --- 開始檢查 ---

truncate_log

# 檢查 0: 強制定期重啟（每 6 小時）避免 MCP 長期假死
if [ -f "$UPTIME_FILE" ]; then
    START_TIME=$(cat "$UPTIME_FILE")
    NOW=$(date +%s)
    ELAPSED=$(( NOW - START_TIME ))
    if [ "$ELAPSED" -gt 21600 ]; then
        restart_tmux_session "定期強制重啟（已運行 $(( ELAPSED / 3600 )) 小時）"
        exit 0
    fi
else
    date +%s > "$UPTIME_FILE"
fi

# 檢查 1: tmux session 存在嗎？
if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    restart_tmux_session "tmux session 不存在"
    exit 0
fi

# 檢查 2: claude 進程存在嗎？
CLAUDE_PID=$(pgrep -f "claude.*channels.*telegram" | head -1)
if [ -z "$CLAUDE_PID" ]; then
    sleep 15
    CLAUDE_PID=$(pgrep -f "claude.*channels.*telegram" | head -1)
    if [ -z "$CLAUDE_PID" ]; then
        restart_tmux_session "Claude 進程不存在"
        exit 0
    fi
fi

# 檢查 3: bun telegram worker 存在嗎？
BUN_PID=$(pgrep -f "bun.*telegram" | head -1)
if [ -z "$BUN_PID" ]; then
    sleep 20
    BUN_PID=$(pgrep -f "bun.*telegram" | head -1)
    if [ -z "$BUN_PID" ]; then
        restart_tmux_session "Bun Telegram worker 不存在"
        exit 0
    fi
fi

# 檢查 4: bun worker 有沒有連到 Telegram API？（偵測假死）
# Telegram API IP 範圍: 149.154.x.x 和 91.108.x.x
CONNECTIONS=$(ss -tnp 2>/dev/null | grep "$BUN_PID" | grep -cE "149\.154|91\.108")
if [ "$CONNECTIONS" -eq 0 ]; then
    sleep 15
    BUN_PID=$(pgrep -f "bun.*telegram" | head -1)
    if [ -n "$BUN_PID" ]; then
        CONNECTIONS=$(ss -tnp 2>/dev/null | grep "$BUN_PID" | grep -cE "149\.154|91\.108")
    fi
    if [ "$CONNECTIONS" -eq 0 ]; then
        restart_tmux_session "Bun worker 無 Telegram API 連線（假死，PID=$BUN_PID）"
        exit 0
    fi
fi

# 檢查 5: inbox 堆積（>10 分鐘未處理 = MCP 或 Claude 卡住）
if [ -d "$INBOX_DIR" ]; then
    OLD_MSGS=$(find "$INBOX_DIR" -type f -mmin +10 2>/dev/null | wc -l)
    if [ "$OLD_MSGS" -gt 2 ]; then
        restart_tmux_session "inbox 堆積 $OLD_MSGS 封 >10 分鐘未處理訊息（MCP 疑似斷線）"
        exit 0
    fi
fi

log "HEALTHY: tmux=ok, claude=$CLAUDE_PID, bun=$BUN_PID, tg_conn=$CONNECTIONS"
