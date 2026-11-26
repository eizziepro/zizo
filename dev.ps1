$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs"
if ($env:PATH -notlike "*$nodeDir*") {
    $env:PATH = "$nodeDir;$env:PATH"
}
npm run dev
