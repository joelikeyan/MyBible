# 1. Target the specific folder from your screenshot
$projectPath = "C:\Users\Jo\BibleApp"

# 2. Check if the folder actually exists just to be safe
if (Test-Path -Path $projectPath) {
    Write-Host "Found the BibleApp folder at: $projectPath" -ForegroundColor Green
} else {
    Write-Host "Could not find the folder! Make sure the path is correct." -ForegroundColor Red
    exit
}

# 3. Create the Configuration Rule File (.cursorrules)
# UPDATED for React Native/Expo based on your file structure
$configContent = @"
# ROLE
You are an expert React Native (Expo) + TypeScript Developer.

# CONTEXT
- Project Name: BibleApp
- Framework: Expo (Managed Workflow)
- Entry Point: App.tsx
- Language: TypeScript

# STRICT GUIDELINES
1. **Components:** Use React Native components (View, Text, TouchableOpacity) NOT HTML tags (div, p, button).
2. **Styling:** Use StyleSheet.create or standard React Native styling.
3. **TypeScript:** Strictly define Interfaces for all component props. No "any" type.
4. **Navigation:** If using React Navigation, ensure routes are typed correctly.
5. **Clean Code:** Keep logic inside hooks or services, keep UI inside components.
"@

# 4. Write the file
Set-Content -Path "$projectPath\.cursorrules" -Value $configContent

Write-Host "Success! The AI rules have been added to your BibleApp folder." -ForegroundColor Cyan