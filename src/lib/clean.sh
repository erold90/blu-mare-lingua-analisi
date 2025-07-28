#!/bin/bash
# Questo script rimuove tutto il codice admin legacy
rm -rf src/components/admin/
rm -rf src/hooks/admin/
rm -rf src/utils/admin/
rm -rf src/hooks/analytics/
rm -rf src/contexts/AuthContext.tsx
rm -rf src/services/supabase/cleaningService.ts