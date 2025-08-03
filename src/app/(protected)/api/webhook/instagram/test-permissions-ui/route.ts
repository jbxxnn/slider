import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Facebook Page Permissions Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 900px; 
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
            margin: 10px 5px;
        }
        button:hover { background: #0056b3; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
        }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .loading { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .step { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px; 
        }
        .step h4 { margin-top: 0; color: #495057; }
        .highlight { background: #fff3cd; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Facebook Page Permissions Test</h1>
        <p>This will make test API calls to Facebook's Page API to unlock permission requests.</p>
        
        <div class="step">
            <h4>📋 What This Does:</h4>
            <ul>
                <li>Tests your current token against Facebook Page APIs</li>
                <li>Makes the API calls Facebook needs to see before enabling permission requests</li>
                <li>Shows you exactly which permissions are missing</li>
                <li>Starts the 24-hour countdown for permission approval</li>
            </ul>
        </div>
        
        <button id="testBtn" onclick="testPermissions()">
            🧪 Run Permission Tests
        </button>
        
        <div id="result"></div>
        
        <div class="step" style="margin-top: 30px;">
            <h4>📝 Next Steps After Testing:</h4>
            <ol>
                <li><strong>Wait up to 24 hours</strong> for Facebook to enable permission requests</li>
                <li><strong>Go to Facebook Developer Console</strong> → App Review → Permissions and Features</li>
                <li><strong>Request these permissions:</strong>
                    <ul>
                        <li><span class="highlight">pages_read_engagement</span></li>
                        <li><span class="highlight">pages_manage_metadata</span></li>
                        <li><span class="highlight">pages_messaging</span></li>
                    </ul>
                </li>
                <li><strong>After approval:</strong> Disconnect and reconnect your Instagram account</li>
                <li><strong>Test webhooks:</strong> Comment on your Instagram post to trigger automation</li>
            </ol>
        </div>
        
        <div class="step" style="background: #e7f3ff;">
            <h4>🎯 Expected Results:</h4>
            <p><strong>Some tests will fail</strong> - this is expected! The failures show Facebook which permissions you need.</p>
            <p><strong>Success:</strong> Facebook will see your API usage and enable permission requests within 24 hours.</p>
        </div>
    </div>

    <script>
        async function testPermissions() {
            const btn = document.getElementById('testBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            btn.textContent = '⏳ Running Tests...';
            result.className = 'result loading';
            result.textContent = 'Making test API calls to Facebook Page APIs...\\nThis may take a few seconds...';
            
            try {
                const response = await fetch('/api/webhook/instagram/test-permissions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.summary && data.summary.successful > 0) {
                    result.className = 'result success';
                    result.textContent = '✅ TESTS COMPLETED!\\n\\n' + JSON.stringify(data, null, 2);
                } else if (data.tests) {
                    result.className = 'result info';
                    result.textContent = '📊 TESTS COMPLETED (Some Expected Failures)\\n\\n' + JSON.stringify(data, null, 2);
                } else {
                    result.className = 'result error';
                    result.textContent = '❌ TEST ERROR\\n\\n' + JSON.stringify(data, null, 2);
                }
            } catch (error) {
                result.className = 'result error';
                result.textContent = '❌ REQUEST ERROR\\n\\n' + error.message;
            }
            
            btn.disabled = false;
            btn.textContent = '🧪 Run Permission Tests';
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
