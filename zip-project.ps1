param(
    [string]$RootPath = $PSScriptRoot
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$RootPath = (Resolve-Path $RootPath).Path.TrimEnd('\', '/')
$zipName = (Split-Path $RootPath -Leaf) + '.zip'
$zipPath = Join-Path $RootPath $zipName
$excludedFolders = @('node_modules', 'dist', '.vite', '.git', '.idea', '.vscode')
$excludedPatterns = @('*.zip', '*.log', '*.tmp', '*.local', '.env', '.env.*')

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    foreach ($file in (Get-ChildItem -Path $RootPath -Recurse -File -Force)) {
        $relativePath = $file.FullName.Substring($RootPath.Length).TrimStart('\', '/')
        $parts = $relativePath -split '[\\/]'
        if ($parts | Where-Object { $excludedFolders -contains $_ }) { continue }
        $excluded = $excludedPatterns | Where-Object { $file.Name -like $_ }
        if ($excluded -and $file.Name -ne '.env.example') { continue }

        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $file.FullName,
            $relativePath.Replace('\', '/'),
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally {
    $archive.Dispose()
}

Write-Host "ZIP created: $zipPath"
