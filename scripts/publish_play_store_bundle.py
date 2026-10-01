#!/usr/bin/env python3
"""
Script to upload and publish an Android App Bundle (.aab) to Google Play Console
using the Google Play Developer Publishing API v3.
"""

import os
import sys
import argparse
import socket
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

socket.setdefaulttimeout(600)

KEY_PATH = '/Users/dorienvandenabbeele/Downloads/gsc_key.json'
PACKAGE_NAME = 'com.heroapps.poquitotalk'

DEFAULT_RELEASE_NOTES = """• Clear and transparent subscription pricing format displaying total billed cost ($39.99/yr) with full cancellation terms.
• Enhanced paywall experience with animated vector mascot and offline stability improvements.
• Post-WhatsApp return flow guidance and offline Bocas del Toro contractor shortcuts."""

def publish_bundle(aab_path, track='internal', release_notes=DEFAULT_RELEASE_NOTES, version_name='1.5.10'):
    if not os.path.exists(aab_path):
        print(f"Error: AAB file not found at {aab_path}")
        sys.exit(1)

    file_size_mb = os.path.getsize(aab_path) / (1024 * 1024)
    print(f"==================================================")
    print(f"Target App: {PACKAGE_NAME}")
    print(f"AAB Path: {aab_path} ({file_size_mb:.2f} MB)")
    print(f"Target Track: {track}")
    print(f"==================================================")

    credentials = service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=['https://www.googleapis.com/auth/androidpublisher']
    )
    service = build('androidpublisher', 'v3', credentials=credentials)

    # 1. Create a new edit
    print("Creating new edit on Google Play...")
    edit = service.edits().insert(packageName=PACKAGE_NAME, body={}).execute()
    edit_id = edit['id']
    print(f"✓ Edit ID: {edit_id}")

    try:
        # 2. Upload the AAB bundle
        print(f"Uploading AAB bundle ({file_size_mb:.2f} MB)...")
        media = MediaFileUpload(
            aab_path,
            mimetype='application/octet-stream',
            chunksize=2 * 1024 * 1024,
            resumable=True
        )
        request = service.edits().bundles().upload(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            media_body=media
        )
        bundle_res = None
        while bundle_res is None:
            status, bundle_res = request.next_chunk()
            if status:
                print(f"  Uploading: {int(status.progress() * 100)}% ({status.resumable_progress / (1024*1024):.1f} MB)...")

        version_code = bundle_res['versionCode']
        sha256 = bundle_res.get('sha256', 'N/A')
        print(f"✓ AAB uploaded successfully!")
        print(f"  Version Code: {version_code}")
        print(f"  SHA256: {sha256}")

        # 3. Create or update the release in the target track
        print(f"Assigning bundle to track '{track}'...")
        release_obj = {
            'name': f"Release {version_code} (v{version_name})",
            'versionCodes': [str(version_code)],
            'status': 'completed',
            'releaseNotes': [
                {
                    'language': 'en-US',
                    'text': release_notes
                }
            ]
        }

        track_body = {
            'track': track,
            'releases': [release_obj]
        }

        track_res = service.edits().tracks().update(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            track=track,
            body=track_body
        ).execute()
        print(f"✓ Release assigned to track '{track}'.")

        # 4. Commit the edit
        print("Committing edit to Google Play Console...")
        try:
            commit_res = service.edits().commit(
                packageName=PACKAGE_NAME,
                editId=edit_id
            ).execute()
        except Exception as commit_err:
            if "changesNotSentForReview" in str(commit_err):
                print("App is in rejected/managed publishing state. Committing with changesNotSentForReview=True...")
                commit_res = service.edits().commit(
                    packageName=PACKAGE_NAME,
                    editId=edit_id,
                    changesNotSentForReview=True
                ).execute()
            else:
                raise commit_err

        print(f"✓ Changes successfully committed!")
        print(f"Commit response: {commit_res}")
        print("\n🎉 The release is now committed on Google Play Console (ready for review submit)!")
        return True

    except Exception as e:
        print(f"\n❌ Failed to publish release: {e}")
        try:
            service.edits().delete(packageName=PACKAGE_NAME, editId=edit_id).execute()
            print("Deleted dangling edit.")
        except Exception:
            pass
        raise e

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Publish AAB to Google Play")
    parser.add_argument('aab_path', help="Path to .aab file")
    parser.add_argument('--track', default='internal', choices=['internal', 'production', 'beta', 'alpha'], help="Release track")
    parser.add_argument('--version-name', default='1.5.10', help="Version name shown in the release name")
    parser.add_argument('--notes-file', help="Text file with en-US release notes (max 500 characters)")
    args = parser.parse_args()

    notes = DEFAULT_RELEASE_NOTES
    if args.notes_file:
        with open(args.notes_file) as f:
            notes = f.read().strip()
    if len(notes) > 500:
        sys.exit(f"Release notes are {len(notes)} characters; Google Play allows 500.")
    publish_bundle(args.aab_path, track=args.track, release_notes=notes, version_name=args.version_name)
