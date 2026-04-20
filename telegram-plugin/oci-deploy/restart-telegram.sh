#!/bin/bash
# Restart claude-telegram tmux session if missing
# 參數對齊 health-check-telegram-tmux.sh，保留對話、跳權限、啟自動模式
TMUX_SESSION="claude-telegram"
CLAUDE_BIN="/home/ubuntu/.local/bin/claude"

if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    tmux new-session -d -s "$TMUX_SESSION"
    sleep 1
    tmux send-keys -t "$TMUX_SESSION" \
        "$CLAUDE_BIN --continue --channels plugin:telegram@claude-plugins-official --dangerously-skip-permissions --enable-auto-mode" Enter
    date +%s > /tmp/claude-telegram-start-time
    echo "$(date): Restarted claude-telegram session" >> /home/ubuntu/telegram-watchdog.log
fi
