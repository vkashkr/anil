#!/usr/bin/env python3
"""
Trigger admin revalidation after a DynamoDB/S3 sync.

Examples:
  python scripts/revalidate_after_sync.py --slug ritika
  python scripts/revalidate_after_sync.py --city ahmedabad
  python scripts/revalidate_after_sync.py --all
"""

import argparse
from getpass import getpass
import os
import subprocess
import sys
from urllib.parse import urlsplit, urlunsplit

import requests

ADMIN_URL = os.environ.get('ADMIN_REVALIDATE_URL', 'https://www.aliyaescort.com/api/admin/revalidate')
ADMIN_LOGIN_URL = os.environ.get('ADMIN_LOGIN_URL')
COOKIE = os.environ.get('ADMIN_AUTH_COOKIE')


def create_admin_session(cookie=None):
    session = requests.Session()
    if cookie:
        session.headers['Cookie'] = cookie
        return session

    password = os.environ.get('ADMIN_PASSWORD') or getpass(
        'Admin password: '
    )
    login_url = ADMIN_LOGIN_URL or urlunsplit(
        (*urlsplit(ADMIN_URL)[:2], '/api/auth/login', '', '')
    )
    resp = session.post(login_url, json={'password': password}, timeout=30)
    if not resp.ok or session.cookies.get('auth_token') != 'authenticated':
        print(f'Admin login failed (HTTP {resp.status_code}).', file=sys.stderr)
        return None
    return session


def post_revalidate(payload, session):
    resp = session.post(ADMIN_URL, json=payload, timeout=30)
    print(f'Status: {resp.status_code}')
    print(resp.text)
    if resp.status_code == 401:
        print(
            'Revalidation was unauthorized. Check that the admin password is correct '
            'and the deployment uses the expected ADMIN_PASSWORD.',
            file=sys.stderr,
        )
    return resp


def run_sync_script(script_name):
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    proc = subprocess.run(
        [sys.executable, script_name],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if proc.stdout:
        print(proc.stdout)
    if proc.stderr:
        print(proc.stderr, file=sys.stderr)
    return proc.returncode


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', help='Single profile slug to revalidate, e.g. ritika')
    ap.add_argument('--city', help='City listing to revalidate, e.g. ahmedabad')
    ap.add_argument('--all', action='store_true', help='Revalidate home and city listings')
    ap.add_argument('--cookie', help='Optional existing admin auth cookie')
    ap.add_argument('--sync', choices=['csv', 'dynamodb', 's3'], help='Optional sync script to run first')
    args = ap.parse_args()

    if not (args.slug or args.city or args.all):
        print('No target provided. Use --slug, --city, or --all.')
        return 1

    if args.sync == 'csv':
        code = run_sync_script('scripts/update_profiles_from_csv.py')
        if code != 0:
            print('CSV sync failed; aborting revalidation.', file=sys.stderr)
            sys.exit(code)
    session = create_admin_session(
        cookie=args.cookie or COOKIE,
    )
    if session is None:
        return 1

    if args.slug:
        payload = {'slug': args.slug}
        return 0 if post_revalidate(payload, session).ok else 1

    if args.city:
        return 0 if post_revalidate({}, session).ok else 1

    if args.all:
        return 0 if post_revalidate({}, session).ok else 1

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
