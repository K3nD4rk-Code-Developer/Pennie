@echo off
echo 🚇 Setting up Cloudflare Tunnel for pennieapp.com
echo.

echo 📥 Step 1: Download cloudflared...
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

echo.
echo 🔑 Step 2: Login to Cloudflare...
echo (This will open your browser - login and authorize)
cloudflared.exe tunnel login

echo.
echo 🚇 Step 3: Create tunnel...
cloudflared.exe tunnel create pennie-tunnel

echo.
echo 📝 Step 4: Create tunnel config...
echo tunnel: pennie-tunnel > config.yml
echo credentials-file: %USERPROFILE%\.cloudflared\[tunnel-id].json >> config.yml
echo. >> config.yml
echo ingress: >> config.yml
echo   - hostname: pennieapp.com >> config.yml
echo     service: http://localhost:3000 >> config.yml
echo   - hostname: api.pennieapp.com >> config.yml
echo     service: http://localhost:5000 >> config.yml
echo   - service: http_status:404 >> config.yml

echo.
echo 🌐 Step 5: Setup DNS records...
echo (This connects your domain to the tunnel)
for /f "tokens=*" %%i in ('cloudflared.exe tunnel list ^| findstr pennie-tunnel') do set TUNNEL_ID=%%i
echo Tunnel ID: %TUNNEL_ID%

cloudflared.exe tunnel route dns pennie-tunnel pennieapp.com
cloudflared.exe tunnel route dns pennie-tunnel api.pennieapp.com

echo.
echo 🚀 Step 6: Run the tunnel...
echo.
echo "To start your tunnel, run:"
echo "cloudflared.exe tunnel --config config.yml run pennie-tunnel"
echo.
echo "Then start your servers:"
echo "npm run dev (on port 3000)"
echo "node server.js (on port 5000)"
echo.
echo "Your local servers will be live at:"
echo "https://pennieapp.com (React app)"
echo "https://api.pennieapp.com (API server)"
echo.
pause