import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Instagram Webhook Subscription Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px;
            margin: 10px 0;
        }
        button:hover { background: #0056b3; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            white-space: pre-wrap;
            font-family: monospace;
        }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .loading { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Instagram Webhook Subscription Test</h1>
        <p>This will attempt to subscribe your Instagram Business account to webhook events.</p>
        
        <button id="subscribeBtn" onclick="subscribeWebhook()">
            🚀 Subscribe to Webhooks
        </button>
        
        <button id="testBtn" onclick="testWebhook()" style="background: #28a745;">
            🧪 Test Webhook Delivery
        </button>
        
        <div id="result"></div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            <h3>📋 Instructions:</h3>
            <ol>
                <li><strong>Click "Subscribe to Webhooks"</strong> - This will attempt to register your Instagram account for webhook events</li>
                <li><strong>If successful:</strong> Go to your Instagram post and comment with your automation keyword</li>
                <li><strong>Check results:</strong> Watch for webhook delivery in your Vercel logs</li>
                <li><strong>If failed:</strong> The error message will tell us what permissions are missing</li>
            </ol>
        </div>
    </div>

    <script>
        async function subscribeWebhook() {
            const btn = document.getElementById('subscribeBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            btn.textContent = '⏳ Subscribing...';
            result.className = 'result loading';
            result.textContent = 'Attempting to subscribe to Instagram webhooks...';
            
            try {
                const response = await fetch('/api/webhook/instagram/subscribe-now', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    result.className = 'result success';
                    result.textContent = '✅ SUCCESS!\\n\\n' + JSON.stringify(data, null, 2);
                } else {
                    result.className = 'result error';
                    result.textContent = '❌ FAILED\\n\\n' + JSON.stringify(data, null, 2);
                }
            } catch (error) {
                result.className = 'result error';
                result.textContent = '❌ ERROR\\n\\n' + error.message;
            }
            
            btn.disabled = false;
            btn.textContent = '🚀 Subscribe to Webhooks';
        }
        
        async function testWebhook() {
            const result = document.getElementById('result');
            result.className = 'result info';
            result.textContent = '🧪 TESTING WEBHOOK DELIVERY\\n\\nNow go to your Instagram post and comment with your automation keyword.\\nThen check your Vercel logs to see if the webhook is received.\\n\\nWebhook URL: ${process.env.NEXT_PUBLIC_HOST_URL}/api/webhook/instagram';
        }
    </script>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
