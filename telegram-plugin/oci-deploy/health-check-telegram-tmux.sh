#!/bin/bash
# Claude Telegram Bot 健康檢查腳本 (tmux 版本)
#
# 監控項目：
#   1. tmux session 是否存在
#   2. claude 進程是否在 tmux 內運行
#   3. bun telegram worker 是否運行
#   4. inbox 是否有訊息堆積（>5 分鐘未處理 = MCP 可能掛了）
#
# 修復策略：
#   - tmux/claude/bun 掛了 → 重建 tmux session
#   - inbox 堆積 → 重建 tmux session（會讓 MCP 重新連線）

set -u

LOG_FILE="/home/ubuntu/telegram-health.log"
TMUX_SESSION="claude-telegram"
INBOX_DIR="/home/ubuntu/.claude/channels/telegram/inbox"
CLAUDE_BIN="/home/ubuntu/.local/bin/claude"
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

restart_tmux_session() {
    local reason="$1"
    log "RESTART: $reason"

    # 殺掉殘留進程
    pkill -9 -f "bun.*telegram" 2>/dev/null || true
    pkill -9 -f "claude.*channels.*telegram" 2>/dev/null || true
    tmux kill-session -t "$TMUX_SESSION" 2>/dev/null || true
    sleep 3

    # 重建 tmux session
    tmux new-session -d -s "$TMUX_SESSION"
    sleep 1
    tmux send-keys -t "$TMUX_SESSION" \
        "$CLAUDE_BIN --channels plugin:telegram@claude-plugins-official --dangerously-skip-permissions --enable-auto-mode" Enter

    log "RESTART: tmux session 已重建，等待 Claude 啟動"
}

# --- 開始檢查 ---

truncate_log

# 檢查 1: tmux session 存在嗎？
if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    restart_tmux_session "tmux session 不存在"
    exit 0
fi

# 檢查 2: claude 進程存在嗎？
CLAUDE_PID=$(pgrep -f "claude.*channels.*telegram" | head -1)
if [ -z "$CLAUDE_PID" ]; then
    # 給 claude 啟動時間（第一次啟動可能還在載入）
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
    # bun worker 是 claude 啟動後由 MCP 拉起的，給多點時間
    sleep 20
    BUN_PID=$(pgrep -f "bun.*telegram" | head -1)
    if [ -z "$BUN_PID" ]; then
        restart_tmux_session "Bun Telegram worker 不存在"
        exit 0
    fi
fi

# 檢查 4: inbox 是否有堆積訊息（>10 分鐘未處理 = MCP 或 Claude 卡住）
# 注意：門檻設為 10 分鐘，避免 Claude 正在長時間思考時被誤殺
if [ -d "$INBOX_DIR" ]; then
    OLD_MSGS=$(find "$INBOX_DIR" -type f -mmin +10 2>/dev/null | wc -l)
    if [ "$OLD_MSGS" -gt 2 ]; then
        restart_tmux_session "inbox 堆積 $OLD_MSGS 封 >10 分鐘未處理訊息（MCP 疑似斷線）"
        exit 0
    fi
fi

log "HEALTHY: tmux=ok, claude=$CLAUDE_PID, bun=$BUN_PID"
