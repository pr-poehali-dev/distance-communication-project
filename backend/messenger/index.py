"""
Мессенджер — единая функция для работы с пользователями, чатами и сообщениями.
Роутинг через query параметр ?action=auth|users|chats|messages + httpMethod.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def resp(status, data, headers=None):
    h = {**CORS, 'Content-Type': 'application/json', **(headers or {})}
    return {'statusCode': status, 'headers': h, 'body': data}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    # POST ?action=auth — регистрация или вход по username
    if method == 'POST' and action == 'auth':
        username = body.get('username', '').strip().lower()
        display_name = body.get('display_name', '').strip()
        if not username:
            return resp(400, {'error': 'username обязателен'})
        if not display_name:
            display_name = username
        avatar = ''.join([w[0].upper() for w in display_name.split()[:2]])
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        if not user:
            cur.execute(
                "INSERT INTO users (username, display_name, avatar) VALUES (%s, %s, %s) RETURNING *",
                (username, display_name, avatar)
            )
            user = cur.fetchone()
            conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'user': dict(user)})

    # GET ?action=users — список всех пользователей
    if method == 'GET' and action == 'users':
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, username, display_name, avatar FROM users ORDER BY display_name")
        users = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return resp(200, {'users': users})

    # POST ?action=chats — создать или найти личный чат
    if method == 'POST' and action == 'chats':
        user_id = int(body.get('user_id', 0))
        target_id = int(body.get('target_id', 0))
        if not user_id or not target_id:
            return resp(400, {'error': 'user_id и target_id обязательны'})
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT c.id FROM chats c
            JOIN chat_members m1 ON m1.chat_id = c.id AND m1.user_id = %s
            JOIN chat_members m2 ON m2.chat_id = c.id AND m2.user_id = %s
            WHERE c.is_group = FALSE
            LIMIT 1
        """, (user_id, target_id))
        existing = cur.fetchone()
        if existing:
            chat_id = existing['id']
        else:
            cur.execute("INSERT INTO chats (is_group) VALUES (FALSE) RETURNING id")
            chat_id = cur.fetchone()['id']
            cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
            cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, target_id))
            conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'chat_id': chat_id})

    # GET ?action=chats&user_id=X — список чатов пользователя
    if method == 'GET' and action == 'chats':
        user_id = int(qs.get('user_id', 0))
        if not user_id:
            return resp(400, {'error': 'user_id обязателен'})
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT
                c.id,
                u.id as partner_id,
                u.display_name as name,
                u.avatar,
                m.text as last_message,
                m.created_at as last_time,
                (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND user_id != %s
                 AND created_at > COALESCE((
                   SELECT MAX(created_at) FROM messages WHERE chat_id = c.id AND user_id = %s
                 ), '1970-01-01')) as unread
            FROM chats c
            JOIN chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
            JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s
            JOIN users u ON u.id = cm2.user_id
            LEFT JOIN LATERAL (
                SELECT text, created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
            ) m ON TRUE
            WHERE c.is_group = FALSE
            ORDER BY COALESCE(m.created_at, c.created_at) DESC
        """, (user_id, user_id, user_id, user_id))
        chats = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return resp(200, {'chats': chats})

    # GET ?action=messages&chat_id=X&after=ID — сообщения чата
    if method == 'GET' and action == 'messages':
        chat_id = int(qs.get('chat_id', 0))
        after = int(qs.get('after', 0))
        if not chat_id:
            return resp(400, {'error': 'chat_id обязателен'})
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        if after:
            cur.execute("""
                SELECT m.id, m.text, m.user_id, m.created_at, u.display_name, u.avatar
                FROM messages m JOIN users u ON u.id = m.user_id
                WHERE m.chat_id = %s AND m.id > %s ORDER BY m.created_at ASC
            """, (chat_id, after))
        else:
            cur.execute("""
                SELECT m.id, m.text, m.user_id, m.created_at, u.display_name, u.avatar
                FROM messages m JOIN users u ON u.id = m.user_id
                WHERE m.chat_id = %s ORDER BY m.created_at ASC LIMIT 100
            """, (chat_id,))
        messages = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return resp(200, {'messages': messages})

    # POST ?action=messages — отправить сообщение
    if method == 'POST' and action == 'messages':
        chat_id = int(body.get('chat_id', 0))
        user_id = int(body.get('user_id', 0))
        text = body.get('text', '').strip()
        if not chat_id or not user_id or not text:
            return resp(400, {'error': 'chat_id, user_id, text обязательны'})
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO messages (chat_id, user_id, text) VALUES (%s, %s, %s) RETURNING *",
            (chat_id, user_id, text)
        )
        msg = dict(cur.fetchone())
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'message': msg})

    return resp(404, {'error': 'Маршрут не найден'})