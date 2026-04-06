#!/bin/bash

# Database migration check script
# Usage: ./scripts/check-migrations.sh

set -e

echo "🔍 Checking database migrations..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check environment
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN not set"
    exit 1
fi

# Link to project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Check for pending migrations
echo "📊 Checking for pending migrations..."
DIFF=$(supabase db diff --linked 2>/dev/null || true)

if [ -z "$DIFF" ] || [ "$DIFF" = "No schema changes found." ]; then
    echo "✅ No pending migrations"
    exit 0
else
    echo "⚠️  Pending migrations detected:"
    echo "$DIFF"
    
    # Check if migrations directory has new files
    NEW_MIGRATIONS=$(git diff --name-only HEAD~1 HEAD -- supabase/migrations/ 2>/dev/null || true)
    
    if [ -n "$NEW_MIGRATIONS" ]; then
        echo "📁 New migration files:"
        echo "$NEW_MIGRATIONS"
        echo "✅ Migrations are tracked in git"
        exit 0
    else
        echo "❌ Schema changes detected but no migration files found!"
        echo "Run: supabase db diff -f <migration_name>"
        exit 1
    fi
fi
