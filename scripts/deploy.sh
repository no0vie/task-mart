#!/usr/bin/env bash

set -Eeuo pipefail

############################################
# CONFIG
############################################

SCRIPT_MARKER=".deploy_nginx_done"
BACKUP_DIR="/var/backups/frontend-deploy"

############################################
# COLORS
############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

############################################
# HELPERS
############################################

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

ask_yes_no() {
    while true; do
        read -rp "$1 (y/n): " yn

        case $yn in
            [Yy]*) return 0 ;;
            [Nn]*) return 1 ;;
            *) echo "Введите y или n" ;;
        esac
    done
}

rollback_nginx() {
    warn "Rollback nginx config..."

    if [[ -f "${NGINX_AVAILABLE}.bak" ]]; then
        cp "${NGINX_AVAILABLE}.bak" "$NGINX_AVAILABLE"

        nginx -t && systemctl reload nginx || true
    fi
}

cleanup_previous_deploy() {
    info "Удаление предыдущего deploy..."

    rm -f "$WWW_LINK"
    rm -f "$NGINX_ENABLED"
    rm -f "$NGINX_AVAILABLE"

    nginx -t && systemctl reload nginx || true

    rm -f "$PROJECT_DIR/$SCRIPT_MARKER"

    info "Очистка завершена."
}

############################################
# ROOT CHECK
############################################

if [[ "$EUID" -ne 0 ]]; then
    error "Скрипт должен запускаться от root."
    echo "Используйте:"
    echo "sudo ./deploy.sh"
    exit 1
fi

############################################
# OS CHECK
############################################

if [[ ! -f /etc/os-release ]]; then
    error "Не удалось определить ОС."
    exit 1
fi

source /etc/os-release

if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
    error "Поддерживаются только Ubuntu/Debian."
    exit 1
fi

info "Обнаружена ОС: $PRETTY_NAME"

############################################
# PROJECT INFO
############################################

PROJECT_DIR="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"

read -rp "Имя проекта [$PROJECT_NAME]: " CUSTOM_NAME

if [[ -n "$CUSTOM_NAME" ]]; then
    PROJECT_NAME="$CUSTOM_NAME"
fi

DIST_DIR="$PROJECT_DIR/dist"

WWW_LINK="/var/www/$PROJECT_NAME"

NGINX_AVAILABLE="/etc/nginx/sites-available/$PROJECT_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$PROJECT_NAME"

mkdir -p "$BACKUP_DIR"

############################################
# PREVIOUS DEPLOY CHECK
############################################

if [[ -f "$PROJECT_DIR/$SCRIPT_MARKER" ]]; then

    warn "Обнаружен предыдущий deploy."

    if ask_yes_no "Выполнить cleanup?"; then
        cleanup_previous_deploy
    else
        warn "Продолжаем без cleanup."
    fi
fi

############################################
# NGINX CHECK
############################################

if ! command -v nginx >/dev/null 2>&1; then

    warn "Nginx не установлен."

    if ask_yes_no "Установить nginx?"; then
        apt update
        apt install -y nginx
    else
        error "Nginx обязателен."
        exit 1
    fi
fi

############################################
# NVM CHECK
############################################

REAL_USER="${SUDO_USER:-root}"

if [[ "$REAL_USER" == "root" ]]; then
    USER_HOME="/root"
else
    USER_HOME=$(eval echo "~$REAL_USER")
fi

NVM_DIR="$USER_HOME/.nvm"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    error "NVM не найден в $NVM_DIR"
    exit 1
fi

source "$NVM_DIR/nvm.sh"

############################################
# NODE VERSION CHECK
############################################

if [[ ! -f ".nvmrc" ]]; then
    error ".nvmrc не найден."
    exit 1
fi

REQUIRED_NODE=$(cat .nvmrc | tr -d '[:space:]')

info "Требуется Node.js: $REQUIRED_NODE"

if ! nvm ls "$REQUIRED_NODE" >/dev/null 2>&1; then

    warn "Node.js $REQUIRED_NODE не установлен."

    if ask_yes_no "Установить Node.js $REQUIRED_NODE?"; then
        nvm install "$REQUIRED_NODE"
    else
        error "Node.js обязателен."
        exit 1
    fi
fi

nvm use "$REQUIRED_NODE"

############################################
# PORT CONFIG
############################################

read -rp "Введите порт для сайта: " PORT

if [[ -z "$PORT" ]]; then
    error "Порт не указан."
    exit 1
fi

if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    error "Порт должен быть числом."
    exit 1
fi

if ss -tulpn | grep -q ":$PORT "; then

    error "Порт $PORT уже используется."

    echo ""
    echo "Использующие процессы:"
    ss -tulpn | grep ":$PORT "

    exit 1
fi

############################################
# HTTPS CONFIG
############################################

ENABLE_SSL=false
DOMAIN=""

if ask_yes_no "Настроить HTTPS через Let's Encrypt?"; then

    ENABLE_SSL=true

    read -rp "Введите домен: " DOMAIN

    if [[ -z "$DOMAIN" ]]; then
        error "Домен обязателен."
        exit 1
    fi
fi

############################################
# BUILD BACKUP
############################################

if [[ -d "$DIST_DIR" ]]; then

    BACKUP_DIST="$BACKUP_DIR/${PROJECT_NAME}_dist_$(date +%Y%m%d_%H%M%S)"

    info "Создание backup dist..."

    cp -R "$DIST_DIR" "$BACKUP_DIST"
fi

############################################
# CLEAN INSTALL
############################################

if ask_yes_no "Удалить node_modules перед сборкой?"; then
    rm -rf node_modules
fi

############################################
# NPM INSTALL
############################################

info "npm install deps..."

if [[ -f package-lock.json ]]; then
    npm ci
else
    npm install
fi

############################################
# BUILD
############################################

info "npm run build..."

npm run build

############################################
# DIST CHECK
############################################

if [[ ! -d "$DIST_DIR" ]]; then
    error "Папка dist не создана."
    exit 1
fi

############################################
# WWW LINK
############################################

info "Создание symlink..."

rm -f "$WWW_LINK"

ln -s "$DIST_DIR" "$WWW_LINK"

############################################
# PERMISSIONS
############################################

info "Настройка прав..."

chown -R www-data:www-data "$DIST_DIR"
chown -h www-data:www-data "$WWW_LINK"

find "$DIST_DIR" -type d -exec chmod 755 {} \;
find "$DIST_DIR" -type f -exec chmod 644 {} \;
############################################
# COPY BUILD TO /var/www
############################################

info "Копирование dist в /var/www..."

if [[ -d "$WWW_LINK" ]]; then

    BACKUP_WWW="$BACKUP_DIR/${PROJECT_NAME}_www_$(date +%Y%m%d_%H%M%S)"

    info "Создание backup текущего deploy..."

    cp -R "$WWW_LINK" "$BACKUP_WWW"
fi

rm -rf "$WWW_LINK"

mkdir -p "$WWW_LINK"

cp -R "$DIST_DIR"/. "$WWW_LINK"/

############################################
# VERIFY COPY
############################################

if [[ ! -f "$WWW_LINK/index.html" ]]; then
    error "index.html не найден после копирования."
    exit 1
fi

############################################
# PERMISSIONS
############################################

info "Настройка прав..."

chown -R www-data:www-data "$WWW_LINK"

find "$WWW_LINK" -type d -exec chmod 755 {} \;
find "$WWW_LINK" -type f -exec chmod 644 {} \;

############################################
# VERIFY NGINX ACCESS
############################################

info "Проверка доступа nginx к файлам..."

if sudo -u www-data test -r "$WWW_LINK/index.html"; then

    info "nginx имеет доступ к index.html"

else

    error "nginx НЕ имеет доступ к index.html"

    exit 1
fi

############################################
# BACKUP NGINX CONFIG
############################################

info "Удаление старых бекапов"

find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +14 -exec rm -rf {} \; 2>/dev/null || true

if [[ -f "$NGINX_AVAILABLE" ]]; then

    info "Создание backup nginx config..."

    cp "$NGINX_AVAILABLE" "${NGINX_AVAILABLE}.bak"
fi


############################################
# NGINX CONFIG
############################################

info "Создание nginx config..."

NGINX_CONFIG=$(cat <<EOF
server {
    listen 0.0.0.0:$PORT;
    listen [::]:$PORT;

    server_name ${DOMAIN:-_};

    root $WWW_LINK;
    index index.html;

    access_log /var/log/nginx/${PROJECT_NAME}_access.log;
    error_log /var/log/nginx/${PROJECT_NAME}_error.log;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)\$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
)

echo "$NGINX_CONFIG" > "$NGINX_AVAILABLE"

ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"

############################################
# NGINX TEST
############################################

info "Проверка nginx config..."

if nginx -t; then

    info "nginx config корректен."

else

    error "Ошибка nginx config."

    rollback_nginx

    exit 1
fi

############################################
# FIREWALL
############################################

if command -v ufw >/dev/null 2>&1; then

    info "Открытие порта в UFW..."

    ufw allow "$PORT"/tcp || true
fi

############################################
# RELOAD NGINX
############################################

info "Reload nginx..."

systemctl reload nginx

############################################
# VERIFY LISTEN
############################################

sleep 1

if ss -tulpn | grep -q ":$PORT "; then

    info "nginx успешно слушает порт $PORT"

else

    error "nginx не слушает порт $PORT"

    rollback_nginx

    exit 1
fi

############################################
# HTTPS
############################################

if [[ "$ENABLE_SSL" == true ]]; then

    if ! command -v certbot >/dev/null 2>&1; then

        info "Установка certbot..."

        apt install -y certbot python3-certbot-nginx
    fi

    info "Настройка HTTPS..."

    certbot --nginx -d "$DOMAIN"

    nginx -t
    systemctl reload nginx
fi

############################################
# FINISH
############################################

touch "$PROJECT_DIR/$SCRIPT_MARKER"

echo ""
info "Deploy успешно завершён."

echo ""
echo "PROJECT : $PROJECT_NAME"
echo "DIST    : $DIST_DIR"
echo "WWW     : $WWW_LINK"
echo "PORT    : $PORT"

if [[ "$ENABLE_SSL" == true ]]; then
    echo "URL     : https://$DOMAIN"
else
    echo "URL     : http://SERVER_IP:$PORT"
fi