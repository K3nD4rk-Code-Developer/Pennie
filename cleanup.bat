@echo off
echo 🧹 Cleaning up ALL Cloudflare configuration files...
echo.

echo 📁 Removing project config files...
if exist wrangler.toml del /f /q wrangler.toml
if exist .wrangler.toml del /f /q .wrangler.toml
if exist _worker.js del /f /q _worker.js
if exist worker.js del /f /q worker.js
if exist .wrangler\ rd /s /q .wrangler
if exist wrangler\ rd /s /q wrangler
if exist functions\ rd /s /q functions
if exist _worker\ rd /s /q _worker

echo 🌐 Removing global config files...
if exist "%USERPROFILE%\.wrangler" rd /s /q "%USERPROFILE%\.wrangler"
if exist "%APPDATA%\wrangler" rd /s /q "%APPDATA%\wrangler"
if exist "%LOCALAPPDATA%\wrangler" rd /s /q "%LOCALAPPDATA%\wrangler"

echo 📦 Cleaning node modules cache...
if exist node_modules\.wrangler\ rd /s /q node_modules\.wrangler
if exist node_modules\.cache\wrangler\ rd /s /q node_modules\.cache\wrangler

echo 🏗️ Cleaning build artifacts...
if exist build\ rd /s /q build
if exist dist\ rd /s /q dist
if exist out\ rd /s /q out
if exist .next\ rd /s /q .next
if exist .vercel\ rd /s /q .vercel
if exist .netlify\ rd /s /q .netlify

echo 🔧 Checking environment files for Cloudflare variables...
if exist .env (
    echo ⚠️  Found .env file - checking for Cloudflare variables:
    findstr /i "cloudflare" .env >nul && echo    Found Cloudflare variables in .env || echo    No Cloudflare variables found
)

if exist .env.local (
    echo ⚠️  Found .env.local file - checking for Cloudflare variables:
    findstr /i "cloudflare" .env.local >nul && echo    Found Cloudflare variables in .env.local || echo    No Cloudflare variables found
)

if exist .env.production (
    echo ⚠️  Found .env.production file - checking for Cloudflare variables:
    findstr /i "cloudflare" .env.production >nul && echo    Found Cloudflare variables in .env.production || echo    No Cloudflare variables found
)

echo 📄 Checking package.json for Cloudflare scripts...
if exist package.json (
    findstr /i "wrangler cloudflare" package.json >nul && echo    Found Cloudflare scripts in package.json || echo    No Cloudflare scripts found
)

echo 🗑️ Clearing NPM cache...
npm cache clean --force >nul 2>&1

echo.
echo ✅ Cleanup complete!
echo.
echo 🔄 Recommended next steps:
echo 1. npm install (reinstall clean dependencies)
echo 2. npm run build (create fresh build)
echo 3. Remove domain from Cloudflare dashboard
echo 4. Re-add domain to Cloudflare as new site
echo 5. Upload fresh build to new Pages project
echo.
echo 🔍 Manual checks needed:
echo - Check .env files for CLOUDFLARE_* variables
echo - Check package.json for wrangler scripts
echo - Verify no hardcoded Cloudflare URLs in your code
echo.
pause