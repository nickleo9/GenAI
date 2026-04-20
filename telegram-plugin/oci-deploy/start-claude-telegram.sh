#!/bin/bash
# Claude Telegram Bot 啟動腳本
# 使用 script 包裝解決 PM2 沒有 TTY 的問題

export PATH="/home/ubuntu/.bun/bin:/home/ubuntu/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

exec script -qfc "claude --channels plugin:telegram@claude-plugins-official --dangerously-skip-permissions --enable-auto-mode" /dev/null
