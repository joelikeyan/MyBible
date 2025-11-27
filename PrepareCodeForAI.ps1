# 1. Target your specific project folder
$projectPath = "C:\Users\Jo\BibleApp"
$outputFile = "$projectPath\ProjectContext_For_AI.txt"

# 2. Start a fresh file
"--- PROJECT CONTEXT FOR GOOGLE AI STUDIO ---" | Out-File -FilePath $outputFile -Encoding utf8

# 3. Define the important file types we want the AI to read
$includeExtensions = @("*.tsx", "*.ts", "*.json", "*.js")
$excludeFolders = @("node_modules", ".expo", ".git", "android", "ios")

# 4. Loop through files and add them to the text file
Get-ChildItem -Path $projectPath -Recurse -Include $includeExtensions | Where-Object {
    $itemPath = $_.FullName
    $shouldSkip = $false
    foreach ($exclude in $excludeFolders) {
        if ($itemPath -match "\\$exclude\\") { $shouldSkip = $true; break }
    }
    if (-not $shouldSkip -and $_.Name -ne "package-lock.json") { return $true }
} | ForEach-Object {
    $relPath = $_.FullName.Replace($projectPath, "")
    " " | Add-Content $outputFile
    "==========================================" | Add-Content $outputFile
    "FILE: $relPath" | Add-Content $outputFile
    "==========================================" | Add-Content $outputFile
    Get-Content $_.FullName | Add-Content $outputFile
}

Write-Host "Success! Upload this file to Google AI Studio:" -ForegroundColor Green
Write-Host $outputFile -ForegroundColor Cyan